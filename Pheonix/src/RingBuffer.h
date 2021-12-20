#ifndef __RINGBUFFER_H__
#define __RINGBUFFER_H__

#include <stdio.h>
#include <stddef.h>
#include <stdint.h>
#include <string.h>
// This class implements a ring buffer for holding wave data

class RingBuffer {

    private:
        char* m_buffer;
        int m_head, m_tail;
        int m_size;
        uint32_t m_chunkSize;

    public:
    // Params are Number of Chunks and Chunks in bytes
        RingBuffer(int numChunks, int chunkSize)
        {
            // constructor

            // Head, tail and size is in # of chunks
            m_head = 0;
            m_tail = 0;
            m_size = numChunks; 

            // m_chunkSize = chunk_in_secs * m_numChannels * m_samplesPerSec * (m_bitsPerSample/8); 
            
            // create buffer
            m_buffer = new char[m_chunkSize * numChunks];
        }
 
        
        ~RingBuffer();
        // Returns the position of the head in chunks
        uint32_t head();
        // Returns the position of the tail in chunks
        uint32_t tail();
        // Returns the size of the buffer in chunks
        //
        // Use rawSize to get the size of the buffer in bytes
        uint32_t size();
        // Returns the size of the buffer in bytes.
        int rawSize(int chunks);

        // Copies one chunk (or specified number) to Ring Buffer. Returns true when copy succeeds, false when copy fails.
        bool writeChunk(void* sourcePtr, int numberOfChunks);
        // Get valid chunks that can be read safely.
        int getValidChunks();
        // Read 1 chunk of data from tail.
        // It doesnt copy memory, just return the tail pointer and update tail
        char * readChunk(void);
        void updateTail(int steps); // move tail by n steps
};

#endif