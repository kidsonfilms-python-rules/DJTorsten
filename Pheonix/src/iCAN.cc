
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
    playerCallbackData_t callback_data[2];

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

    callback_data[0].nextBufIdx = 1;
    callback_data[0].chunkSize = m_chunkSize;
    callback_data[0].loopCtrl = m_loopCtrl;
    callback_data[0].ringBuf = m_ringBuffer;
    callback_data[0].count = 0;
    //printf("before player callbach\n");

    // jray: allocate memory of the audio queue -- just for 1 chunk
    status = AudioQueueAllocateBuffer(queue, m_chunkSize, &buf_ref1);
    printf("Allocate buf1 status: %d, %d\n", status, m_chunkSize);

    buf = buf_ref1;
    printf("buf: %p, data: %p, len: %d\n", buf, buf->mAudioData, buf->mAudioDataByteSize);
    buf->mAudioDataByteSize = m_chunkSize;

    //printf("here after\n");

    callback_data[1].nextBufIdx = 1;
    callback_data[1].chunkSize = m_chunkSize;
    callback_data[1].loopCtrl = m_loopCtrl;
    callback_data[1].ringBuf = m_ringBuffer;
    callback_data[1].count = 0;


    // start the loop by calling playerCallBack()
    iCAN::playerCallBack((void *)&callback_data[0], queue, buf_ref0);
    iCAN::playerCallBack((void *)&callback_data[1], queue, buf_ref1);

    printf("done init..\n");

    status = AudioQueueSetParameter(queue, kAudioQueueParam_Volume, 1.0);
    printf("Volume status: %d\n", status);

    status = AudioQueueStart(queue, NULL);
    printf("Start status: %d\n", status);

    for (int i = 0; i < 1; i++)
    {
        CFRunLoopRunInMode(
            kCFRunLoopDefaultMode,
            61,   // seconds
            false // don't return after source handled
        );
        printf("after cfrunloop\n");
    }

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

    printf("In PlayerCallback, %d\n", (cbdata_ref->count)++);

    if (loopCtrl->stop.load(std::memory_order_acquire))
        return; // stop the player

    //printf("before loop\n");

    // check if the ring buffer has valid chunk to play
    while (ringBuf->getValidChunks() <= 0)
    {
        //printf ("firing once\n");
        //if (loopCtrl->stop.load(std::memory_order_acquire)) return; // stop playing
        //printf("after return\n");
        // sleep for some time, then check again
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }

    //printf("Callback ,cnt=%d\n", chunkSize);

    // copy 1 chunk of data from RingBuffer to the player queue
    AudioQueueBuffer *buf = buf_ref;

    memcpy((void *)buf->mAudioData, (void *)(ringBuf->readChunk()), chunkSize);
    //printf("after memcopy \n");

    OSStatus status = AudioQueueEnqueueBuffer(queue, buf_ref, 0, NULL);
    printf("Enqueue status: %d\n", status);
    //printf("tail: %d\n", tail);
}