#include "RingBuffer.h"

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
// TODO: writing to the ring-buf and increasing head pointer is not atomic. This is OK for now since writing is only done
//   by one thread.
bool RingBuffer::writeChunk(void *sourcePtr, int numberOfChunks)
{
    if (numFreeChunks() >= numberOfChunks + 1) //need one extra entry of buffer, otherwise head==tail will be confusing
    {
        int head = m_head.load(std::memory_order_relaxed);
        //printf ("wrote chunk %d, at head %d\n", numberOfChunks, head);
        memcpy((void *)(m_buffer + head*m_chunkSize), sourcePtr, (size_t)(m_chunkSize*numberOfChunks));
        head = (head + numberOfChunks)%m_size;
        m_head.store(head, std::memory_order_release);

        return true;
    }
    return false;
}

bool RingBuffer::writeChunkBytes(void *sourcePtr, unsigned byteOffset, unsigned bytes)
{
    if (numFreeChunks() >= 2) // need one extra chunk
    {
        assert(byteOffset + bytes <= m_chunkSize); //cannot go past chunk boundary
        int head = m_head.load(std::memory_order_relaxed);
        memcpy((void *)(m_buffer + head*m_chunkSize + byteOffset), sourcePtr, (size_t)bytes);
    }
    return false;
}

//update head by n steps
void RingBuffer::updateHead(int steps)
{
    assert(numFreeChunks() >= steps + 1); //make sure tail is not bypassing head
    int head = (m_head.load(std::memory_order_relaxed) + steps) % m_size;
    m_head.store(head, std::memory_order_release);
}

// get number of valid chunks in the buffer
int RingBuffer::getValidChunks()
{
    // if head==tail, means the ring buf is empty
    int delta;
    int head = m_head.load(std::memory_order_relaxed);
    int tail = m_tail.load(std::memory_order_relaxed);
    if (head >= tail)
    {
        delta = head - tail;
    }
    else
    {
        delta = (m_size - tail) + head;
    }
    return delta;
}

int RingBuffer::numFreeChunks() 
{
    return (m_size - getValidChunks());
}

// Returns next valid chunk pointer. If there is no valid chunks, it will return NULL pointer. Can pass number of chunks.
// It doesnt copy memory, just return the tail pointer and update tail.
// TODO: currently the readChunk and tail update are separate and not one atomic function. Same as writeChunk and update of
//  head pointer. This is not a problem because there is only 1 thread reading and 1 thread writing to the ring.
//   This will break if there are multiple threads reading or multiple threads writing to the Ring. For robustness , the 
//   read/write of the Ring and tail/head pointer update should be made atomic. Need to use cmp-exchange for that..
char *RingBuffer::readChunk(void)
{
    if (getValidChunks() >= 1) {
        int tail = m_tail.load(std::memory_order_acquire);
        char * ptr = (m_buffer + (tail * m_chunkSize));
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
