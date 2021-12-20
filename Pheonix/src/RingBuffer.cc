#include "RingBuffer.h"
#include <assert.h>

RingBuffer::~RingBuffer()
{
    delete (m_buffer);
}

uint32_t RingBuffer::head()
{
    return m_head;
}

uint32_t RingBuffer::tail()
{
    return m_tail;
}

uint32_t RingBuffer::size()
{
    return m_size;
}

int RingBuffer::rawSize(int chunks)
{
    return m_chunkSize * chunks;
}

// Copies one chunk to Ring Buffer. Returns true when copy succeeds, false when copy fails.
bool RingBuffer::writeChunk(void *sourcePtr, int numberOfChunks)
{
    if (getValidChunks() < (m_size - numberOfChunks))
    {
        memcpy((void *)(m_buffer + m_head*m_chunkSize), sourcePtr, (size_t)(m_chunkSize*numberOfChunks));
        m_head = (m_head + numberOfChunks) % m_size;
        return true;
    }
    return false;
}


int RingBuffer::getValidChunks()
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

    return delta + 1;
}

// Returns next valid chunk pointer. If there is no valid chunks, it will return NULL pointer. Can pass number of chunks.
// It doesnt copy memory, just return the tail pointer and update tail
char *RingBuffer::readChunk(void)
{
    if (getValidChunks() >= 1) {
        // update tail
        char * ptr = (m_buffer + (m_tail * m_chunkSize));
        // m_tail = 
        return ptr;
    }
    else
    {
        // printf("%d\n", getValidChunks());
        return (NULL);
    }
}

//update tail by n steps
void RingBuffer::updateTail(int steps)
{
    assert(getValidChunks() > steps); //make sure tail is not bypassing head
    m_tail = (m_tail + steps) % m_size;
}
