#include "ringBuffer.h"

ringBuffer::~ringBuffer()
{
    delete (m_buffer);
}

uint32_t ringBuffer::head()
{
    return m_head;
}

uint32_t ringBuffer::tail()
{
    return m_tail;
}

uint32_t ringBuffer::size()
{
    return m_size;
}

int ringBuffer::rawSize(int chunks)
{
    return m_chunkSize * chunks;
}

// Copies one chunk to Ring Buffer. Returns true when copy succeeds, false when copy fails.
bool ringBuffer::writeChunk(void *sourcePtr, int numberOfChunks)
{
    if (getValidChunks() < (m_size - numberOfChunks))
    {
        printf("----------------START WRITE----------------\nStarting HEAD: %d\n", m_head);
        memcpy((void *)(m_buffer + m_head*m_chunkSize), sourcePtr, (size_t)(m_chunkSize*numberOfChunks));
        m_head = (m_head + numberOfChunks) % m_size;
        printf("Ending HEAD: %d\n-----------------END WRITE-----------------\n", m_head);
        return true;
    }
    return false;
}

// Read 1 chunk of data from tail.
// It doesnt copy memory, just return the tail pointer and update tail
int ringBuffer::getValidChunks()
{
    // if head==tail, means there is not enough data
    int delta;
    if (m_head >= m_tail)
    {
        delta = m_head - m_tail;
    }
    else
    {
        delta = (m_size - m_tail) + m_head;
    }

    return delta;
}

// Returns next valid chunk pointer. If there is no valid chunks, it will return NULL pointer. Can pass number of chunks.
char *ringBuffer::readChunk(int numChunks)
{
    if (getValidChunks() > numChunks + 1)
    {
        // update tail
        char * ptr = (m_buffer + (m_tail * m_chunkSize));
        m_tail = (m_tail + numChunks) % m_size;
        return ptr;
    }
    else
    {
        printf("READ ERROR RINGBUFFER");
        return (NULL);
    }
}