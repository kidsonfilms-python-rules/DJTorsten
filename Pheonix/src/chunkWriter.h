// Chunk Write class
// This class writes song chunks in to the ring buffer, and enqueues the chunk to be played.
// 
#ifndef __CHUNK_WRITER__
#define __CHUNK_WRITER__

#include "RingBuffer.h"


class chunkWriter 
{
    private:
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
        chunkWriter(int bufferSizeInMs, int chunkInMs, uint16_t numChannels, uint16_t bitsPerSample, uint32_t samplesPerSec)
        {
            m_chunkSize = (chunkInMs * m_numChannels * m_samplesPerSec * (m_bitsPerSample/8))/1000;
            m_numChunks = bufferSizeInMs/chunkInMs + 1; //+1 for rounding up

            m_ringBuffer = new RingBuffer(m_numChunks, m_chunkSize);
        }

        ~chunkWrite()
        {
            delete m_ringBuffer;
        }

        void prepareChunk(void *bufferPtr, int numChunks);

        void playerCallBack();

}
#endif
