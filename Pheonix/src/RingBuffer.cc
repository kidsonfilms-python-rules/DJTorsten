#include "RingBuffer.h"
#include <assert.h>

RingBuffer::~RingBuffer()
{
    delete (m_buffer);
}

uint32_t RingBuffer::head()
{
    return m_head.load(std::memory_order_acquire);
}

uint32_t RingBuffer::tail()
{
    return m_tail.load(std::memory_order_acquire);
}

uint32_t RingBuffer::size()
{
    return m_size;
}

int RingBuffer::rawSize(int chunks)
{
    return m_chunkSize * chunks;
}

// Copies one chunk to Ring Buffer. Returns true when copy succeeds, false when copy fails (not enough mem)
bool RingBuffer::writeChunk(void *sourcePtr, int numberOfChunks)
{
    if (getValidChunks() < (m_size - numberOfChunks))
    {
        int head = m_head.load(std::memory_order_relaxed);
        memcpy((void *)(m_buffer + head*m_chunkSize), sourcePtr, (size_t)(m_chunkSize*numberOfChunks));
        head = (head + numberOfChunks)%m_size;
        m_head.store(head, std::memory_order_release);
        return true;
    }
    return false;
}


int RingBuffer::getValidChunks()
{
    // if head==tail, means there is not enough data
    int delta;
    int head = m_head.load(std::memory_order_relaxed);
    int tail = m_tail.load(std::memory_order_relaxed);
    if (head >= tail)
    {
        delta = head - tail;
    }
    else
    {
        delta = (m_size - tail) + head - 1;
    }

    return delta;
}

int RingBuffer::numFreeChunks() 
{
    return (m_size - getValidChunks());
}

// Returns next valid chunk pointer. If there is no valid chunks, it will return NULL pointer. Can pass number of chunks.
// It doesnt copy memory, just return the tail pointer and update tail
char *RingBuffer::readChunk(void)
{
    if (getValidChunks() >= 2) {
        //TODO: update tail pointer by 1 step //todo
        int tail = m_tail.load(std::memory_order_relaxed);
        char * ptr = (m_buffer + (m_tail * m_chunkSize));
        return ptr;
    }
    else
    {
        assert(0); //stop!
        // printf("%d\n", getValidChunks());
        return (NULL);
    }
}

//update tail by n steps
void RingBuffer::updateTail(int steps)
{
    assert(getValidChunks() >= steps); //make sure tail is not bypassing head
    int tail = (m_tail.load(std::memory_order_relaxed) + steps) % m_size;
    m_tail.store(tail, std::memory_order_release);
}
