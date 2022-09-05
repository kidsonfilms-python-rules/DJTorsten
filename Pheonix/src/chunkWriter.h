// Chunk Write class
// This class writes song chunks in to the ring buffer, and enqueues the chunk to be played.
//
#ifndef __CHUNK_WRITER__
#define __CHUNK_WRITER__

#include "RingBuffer.h"
#include "thePlan.h"
#include <atomic>
#include <vector>

// struct to start/stop/pause playing
typedef struct
{
    std::atomic_bool stop;
    // thats all for now
} playloopControl_t;

// struct to hold all information about a track
typedef struct
{
    char *data_buffer; // buffer to hold the track data
    int track_id;      // track id from the Plan
    int cur_offset;    // current chunk offset in the track
    int num_chunks;    // number of chunks in the track
} trackDescriptor_t;

typedef struct
{
    // Allow only up to 4 tracks open at a time. TODO : make this dynamic later
    trackDescriptor_t openTracks[4];
    std::vector<int> freeTrackList;
    std::vector<int> currentTrackList;
} openTrackManager_t;

class chunkWriter
{
private:
    ThePlan *m_plan; // ptr to plan class
    playloopControl_t *m_loopCtrl;

    RingBuffer *m_ringBuffer; // instantiate ringbuffer
    // audio header data
    uint16_t m_numChannels, m_bitsPerSample;
    uint32_t m_samplesPerSec;

    openTrackManager_t m_trackManager;

    // chunk info
    unsigned m_chunkSize;  // chunk size in bytes
    unsigned m_chunkInMs;  // chunk size in ms
    unsigned m_numChunks;  // number of chunks in the ring buffer
    unsigned m_sampleSize; // size per sample in bytes

public:
    // constructor
    chunkWriter(ThePlan *plan, playloopControl_t *loop_ctrl, unsigned bufferSizeInMs, unsigned chunkInMs, uint16_t numChannels, uint16_t bitsPerSample, uint32_t samplesPerSec)
    {
        m_chunkSize = (chunkInMs * numChannels * samplesPerSec * (bitsPerSample / 8)) / 1000;
        // m_chunkSize = 11520000;
        m_numChunks = (bufferSizeInMs / chunkInMs) + 1; //+1 for rounding up

        // printf ("ring buf size=%d\n", m_numChunks);
        m_ringBuffer = new RingBuffer(m_numChunks, m_chunkSize);

        m_plan = plan;
        m_loopCtrl = loop_ctrl;
        m_samplesPerSec = samplesPerSec;
        m_numChannels = numChannels;
        m_bitsPerSample = bitsPerSample;
        m_sampleSize = (bitsPerSample * numChannels) / 8;
        m_chunkInMs = chunkInMs;

        m_trackManager.freeTrackList.push_back(0);
        m_trackManager.freeTrackList.push_back(1);
        m_trackManager.freeTrackList.push_back(2);
        m_trackManager.freeTrackList.push_back(3);
    }

    ~chunkWriter()
    {
        delete m_ringBuffer;
    }

    void run_loop();
    void prepareChunk(void *bufferPtr, int numChunks);
    RingBuffer *ring()
    {
        return m_ringBuffer; // return the pointer to the ringbuffer object
    }
    bool scaledChunkCopy(size_t, int);

    int findTrackById(int id)
    {
        for (std::vector<int>::iterator it = m_trackManager.currentTrackList.begin(); 
            it != m_trackManager.currentTrackList.end(); it++) {
                if (id == m_trackManager.openTracks[*it].track_id)
                    return *it;
            }
        return (-1); // -1 if nothing matches
    }

    void removeFromCurList(int val)
    {
        for (std::vector<int>::iterator it = m_trackManager.currentTrackList.begin(); 
            it != m_trackManager.currentTrackList.end();)
        {
            if (*it == val)
            {
                it = m_trackManager.currentTrackList.erase(it);
            }
            else
            {
                ++it;
            }
        }
        // currentTrackList.remove(currentTrackList.begin(), currentTrackList.end(), val);
    }

    void mixTracksChunk(char *, char *, char *);
};
#endif
