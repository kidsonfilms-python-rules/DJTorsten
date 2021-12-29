// iCAN --> integrated CANARY
//  This class copies audio data from the ring buffer to the Audio queue and plays it.

#ifndef __ICAN_H__
#define __ICAN_H__

#include <unistd.h>
#include "AudioToolbox/AudioToolbox.h"
#include "RingBuffer.h"
#include "chunkWriter.h"

// data to pass to the callback function.
typedef struct {
    int nextBufIdx; // buffer idx to use next
    RingBuffer *ringBuf;
    playloopControl_t *loopCtrl;
    int chunkSize;
    int count;
} playerCallbackData_t;


class iCAN {
    private:
        RingBuffer *m_ringBuffer;
        playloopControl_t *m_loopCtrl;

        // audio header data
        uint16_t m_numChannels, m_bitsPerSample;
        uint32_t m_samplesPerSec;
        // chunk info
        int m_chunkSize; //chunk size in bytes

    public:
        //constructor
        iCAN(RingBuffer *ring_buf, playloopControl_t *loop_ctrl, 
             int chunkInMs, uint16_t numChannels, uint16_t bitsPerSample, uint32_t samplesPerSec)
             {
                m_chunkSize = (chunkInMs * numChannels * samplesPerSec * (bitsPerSample/8))/1000;
                //m_chunkSize = 11520000;
                m_loopCtrl = loop_ctrl;
                m_numChannels = numChannels;
                m_bitsPerSample = bitsPerSample;
                m_samplesPerSec = samplesPerSec;
                m_ringBuffer = ring_buf;
                printf ("%d, %d, %d, %d, %d\n", m_chunkSize, chunkInMs, m_numChannels, bitsPerSample, m_samplesPerSec);
             }

        // player functions
        void run_loop();
        //callback fn
        static void playerCallBack(void *callback_data, AudioQueueRef queue, AudioQueueBufferRef buf_ref);

};
#endif