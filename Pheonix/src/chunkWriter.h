// Chunk Write class
// This class writes song chunks in to the ring buffer, and enqueues the chunk to be played.
// 
#ifndef __CHUNK_WRITER__
#define __CHUNK_WRITER__

#include "RingBuffer.h"
#include "thePlan.h"
#include <atomic>

// struct to start/stop/pause playing
typedef struct {
    std::atomic_bool stop;
    // thats all for now
} playloopControl_t;


class chunkWriter 
{
    private:
        ThePlan *m_plan; // ptr to plan class
        playloopControl_t *m_loopCtrl; 

        RingBuffer *m_ringBuffer;  //instantiate ringbuffer
        // audio header data
        uint16_t m_numChannels, m_bitsPerSample;
        uint32_t m_samplesPerSec;
        // chunk info
        int m_chunkSize; //chunk size in bytes
        int m_chunkInMs; // chunk size in ms
        int m_numChunks; // number of chunks in the ring buffer

    public:
        //constructor
        chunkWriter(ThePlan *plan, playloopControl_t *loop_ctrl, int bufferSizeInMs, int chunkInMs, uint16_t numChannels, uint16_t bitsPerSample, uint32_t samplesPerSec)
        {
            m_chunkSize = (chunkInMs * numChannels * samplesPerSec * (bitsPerSample/8))/1000;
            //m_chunkSize = 11520000;
            m_numChunks = (bufferSizeInMs/chunkInMs) + 1; //+1 for rounding up

            printf ("ring buf size=%d\n", m_numChunks);
            m_ringBuffer = new RingBuffer(m_numChunks, m_chunkSize);

            m_plan = plan;
            m_loopCtrl = loop_ctrl;
        }

        ~chunkWriter()
        {
            delete m_ringBuffer;
        }

        void run_loop();
        void prepareChunk(void *bufferPtr, int numChunks);
        RingBuffer *ring() {
            return m_ringBuffer; // return the pointer to the ringbuffer object
        }
};
#endif
