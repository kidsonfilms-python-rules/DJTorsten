
#include "iCAN.h"
#include <chrono>
#include <thread>

void iCAN::run_loop()
{
    //init audio queues
    AudioQueueRef queue;

    OSStatus status;
    AudioStreamBasicDescription fmt = {0};
    AudioQueueBufferRef buf_ref0, buf_ref1; // two buffers to ping-pong 

    fmt.mSampleRate = m_samplesPerSec;
    fmt.mFormatID = kAudioFormatLinearPCM;
    fmt.mFormatFlags = kAudioFormatFlagIsSignedInteger | kAudioFormatFlagIsPacked;
    fmt.mFramesPerPacket = 1; // jray: idk
    fmt.mChannelsPerFrame = m_numChannels;
    fmt.mBytesPerPacket = fmt.mBytesPerFrame = (m_numChannels * m_bitsPerSample) / 8; // x2 for stereo
    fmt.mBitsPerChannel = m_bitsPerSample;

    // create data struct to pass to the callback function
    playerCallbackData_t callback_data;

    // jray: creates the audio queue
    status = AudioQueueNewOutput(&fmt, iCAN::playerCallBack, &callback_data, CFRunLoopGetCurrent(),
                                 kCFRunLoopCommonModes, 0, &queue);

    if (status == kAudioFormatUnsupportedDataFormatError)
        puts("oops!");
    else
        printf("NewOutput status: %d\n", status);

    // jray: allocate memory of the audio queue -- just for 1 chunk
    status = AudioQueueAllocateBuffer(queue, m_chunkSize, &buf_ref0);
    printf("Allocate buf0 status: %d, %d\n", status, m_chunkSize);

    AudioQueueBuffer *buf = buf_ref0;
    printf("buf: %p, data: %p, len: %d\n", buf, buf->mAudioData, buf->mAudioDataByteSize);
    buf->mAudioDataByteSize = m_chunkSize;

    //printf("here after\n");

    callback_data.nextBufIdx = 0;
    callback_data.chunkSize = m_chunkSize;
    callback_data.loopCtrl = m_loopCtrl;
    callback_data.ringBuf = m_ringBuffer;
    callback_data.count = 0;
    //printf("before player callbach\n");

    // jray: allocate memory of the audio queue -- just for 1 chunk
    status = AudioQueueAllocateBuffer(queue, m_chunkSize, &buf_ref1);
    printf("Allocate buf1 status: %d, %d\n", status, m_chunkSize);

    buf = buf_ref1;
    printf("buf: %p, data: %p, len: %d\n", buf, buf->mAudioData, buf->mAudioDataByteSize);
    buf->mAudioDataByteSize = m_chunkSize;

    // start the loop by calling playerCallBack()
    iCAN::playerCallBack((void *)&callback_data, queue, buf_ref0);
    iCAN::playerCallBack((void *)&callback_data, queue, buf_ref1);

    status = AudioQueueSetParameter(queue, kAudioQueueParam_Volume, 1.0);
    printf("Volume status: %d\n", status);

    status = AudioQueueStart(queue, NULL);
    printf("Start status: %d\n", status);

    do {
        //printf ("in do loop %d\n", m_loopCtrl->stop.load(std::memory_order_acquire));
        CFRunLoopRunInMode(
            kCFRunLoopDefaultMode,
            2,   // seconds
            false // don't return after source handled
        );
    } while (!m_loopCtrl->stop.load(std::memory_order_acquire));
    

    // while (!(m_loopCtrl->stop.load(std::memory_order_acquire)))
    // {
    //     // sleep for some time, then check again
    //     std::this_thread::sleep_for(std::chrono::milliseconds(10));
    // }
}

void iCAN::playerCallBack(void *callback_data_ptr, AudioQueueRef queue, AudioQueueBufferRef buf_ref)
{
    // get the call back info ...
    playerCallbackData_t *cbdata_ref = (playerCallbackData_t *)callback_data_ptr;

    RingBuffer *ringBuf = cbdata_ref->ringBuf;
    playloopControl_t *loopCtrl = cbdata_ref->loopCtrl;
    int chunkSize = cbdata_ref->chunkSize;

    //printf("In PlayerCallback, %d, %p\n", (cbdata_ref->count)++, buf_ref->mAudioData);

    // check if the ring buffer has valid chunk to play
    while (ringBuf->getValidChunks() <= 0)
    {
        // sleep for some time, then check again
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
        // stop if we are supposed to
        if (loopCtrl->stop.load(std::memory_order_acquire))
            return; // stop the player
    }

    // stop if we are supposed to
    if (loopCtrl->stop.load(std::memory_order_acquire))
        return; // stop the player


    //printf("Callback loading memory,cnt=%d\n", chunkSize);

    // copy 1 chunk of data from RingBuffer to the player queue
    AudioQueueBuffer *buf = buf_ref;

    memcpy((void *)buf->mAudioData, (void *)(ringBuf->readChunk()), chunkSize);
    ringBuf->updateTail(1);

    //enqueue this chunk
    AudioQueueEnqueueBuffer(queue, buf_ref, 0, NULL);
}