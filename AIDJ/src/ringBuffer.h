#include <stdio.h>
#include <stddef.h>
#include <stdint.h>
#include <string.h>
// This class implements a ring buffer for holding wave data

class ringBuffer {

    private:
        char* m_buffer;
        uint32_t m_head, m_tail;
        uint32_t m_size;
        uint32_t m_chunkSize;

        // audio header data
        uint16_t m_numChannels, m_bitsPerSample;
        uint32_t m_samplesPerSec;


    public:
    // Params are Number of Chunks and Chunks in seconds
        ringBuffer(int numChunks, int chunk_in_secs)
        {
            // constructor

            // Head, tail and size is in # of chunks
            m_head = 0;
            m_tail = 0;
            m_size = numChunks; 

            m_numChannels = 2;
            m_bitsPerSample = 16;
            m_samplesPerSec = 48000;

            m_chunkSize = chunk_in_secs * m_numChannels * m_samplesPerSec * (m_bitsPerSample/8); 
            
            // create buffer
            m_buffer = new char[m_chunkSize * numChunks];
        }
 
        
        ~ringBuffer();
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
        char * readChunk(int numChunks);
};
