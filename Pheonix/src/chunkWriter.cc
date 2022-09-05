#include "chunkWriter.h"
#include <thread>
#include <chrono>

void chunkWriter::run_loop()
{

    int recordCnt = 0;
    int chunkCnt = 0;

    // slient chunk --> fill with zeroes
    char *silent_chunk = new char[m_chunkSize];
    memset((void *)silent_chunk, 0, m_chunkSize);

    // the chunk writer loops through chunk and checks if the current
    //   record (in Plan) impacts this chunk or not.

    // wait until there is at least 1 record in the Plan
    while (m_plan->size() <= recordCnt)
    {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        if (m_loopCtrl->stop.load(std::memory_order_relaxed))
        {
            return;
        }
    }
    // item to store commands from Plan
    planRecord_t item;
    // this variable indicates whether a Plan item is pending or not
    bool planItemPending = false;

    while (!m_loopCtrl->stop.load(std::memory_order_relaxed))
    {

        // load the next record from Plan if available
        if ((m_plan->size() > recordCnt) && !(planItemPending))
        {
            item = m_plan->readPlanRecord(recordCnt++);
            planItemPending = true;
        }

        if (planItemPending && (chunkCnt == item.chunk))
        {
            // This record should be activated now
            //  Parse record
            std::string filePath;
            std::ifstream file;
            std::streamsize size;
            int desc_num, desc_id;

            switch (item.command)
            {
            case PLAY:
            {
                assert(m_trackManager.freeTrackList.size() <= 4); // cannot open more than 4 tracks at a time
                // debug
                std::cout << "processed PLAY" << std::endl;
                filePath = item.filePath;
                file.open(filePath, std::ios::binary | std::ios::ate);
                size = file.tellg();
                // sanity check: if offset is larger than file size, skip
                assert(item.offset * m_chunkSize < size - 44);
                // TODO: chunkSize (in bytes) should come from the
                int start_offset = 44 + item.offset * m_chunkSize;
                file.seekg(start_offset, std::ios::beg);
                // get a free track descriptor to use
                desc_num = m_trackManager.freeTrackList.back();
                m_trackManager.freeTrackList.pop_back();
                m_trackManager.currentTrackList.push_back(desc_num);
                m_trackManager.openTracks[desc_num].track_id = item.trackId;
                m_trackManager.openTracks[desc_num].data_buffer = new char[size];
                m_trackManager.openTracks[desc_num].cur_offset = 0;                                       // this is next chunk to be played in the track
                m_trackManager.openTracks[desc_num].num_chunks = (size - 44) / m_chunkSize - item.offset; // skipped header (44 bytes)
                file.read(m_trackManager.openTracks[desc_num].data_buffer, size - start_offset);
                file.close();
                break;
            }
            case STOP:
            {
                desc_id = findTrackById(item.trackId);
                // It is possible that this track has already stopped because it ran out.
                //  In that case findTrackById() will return -1.
                if (desc_id >= 0)
                {
                    removeFromCurList(desc_id);
                    m_trackManager.freeTrackList.push_back(desc_id);
                    // free up data_buffer
                    free(m_trackManager.openTracks[desc_id].data_buffer);
                }
                break;
            }
            default:
                break;
            }
            // clear pending item
            planItemPending = false;
        }

        // if there are active tracks, write 1 chunk to RingBuffer
        if (m_trackManager.currentTrackList.size() > 2)
        {
            // TODO: not allowing more than 2 track now.
            assert(false);
        }
        else if (m_trackManager.currentTrackList.size() > 0)
        {
            int desc_id0 = m_trackManager.currentTrackList.at(0);
            char *buffer0 = m_trackManager.openTracks[desc_id0].data_buffer;
            int offset0 = m_trackManager.openTracks[desc_id0].cur_offset++;
            int num_chunks0 = m_trackManager.openTracks[desc_id0].num_chunks;

            // if another track is open, get that too
            int desc_id1, offset1, num_chunks1;
            char *buffer1;
            char *output_buffer;
            if (m_trackManager.currentTrackList.size() == 2)
            {
                desc_id1 = m_trackManager.currentTrackList.at(1);
                buffer1 = m_trackManager.openTracks[desc_id1].data_buffer;
                offset1 = m_trackManager.openTracks[desc_id1].cur_offset++;
                num_chunks1 = m_trackManager.openTracks[desc_id1].num_chunks;

                // allocate 1 chunk of buffer
                output_buffer = new char[m_chunkSize];
                // mix the songs
                mixTracksChunk((char *)(buffer0 + offset0 * m_chunkSize), (char *)(buffer1 + offset1 * m_chunkSize), output_buffer);
            }
            else
            {
                // only 1 track to play (buffer0)
                output_buffer = buffer0 + offset0 * m_chunkSize;
            }

            bool status = false;
            while (!status)
            {
                status = m_ringBuffer->writeChunk(output_buffer, 1);
                // std::cout << "Copied 1 chunk" << std::endl;
                if (!status)
                {
                    // ring full.. wait
                    // printf ("ring full..\n");
                    // wait 10ms
                    std::this_thread::sleep_for(std::chrono::milliseconds(10));
                }
                else
                {
                    break;
                }
            }

            // check if the track is complete
            if (offset0 == num_chunks0)
            {
                // close this track, it has ended
                removeFromCurList(desc_id0);
                m_trackManager.freeTrackList.push_back(desc_id0);
                // free up data_buffer
                free(m_trackManager.openTracks[desc_id0].data_buffer);
                // std::cout << "closed track" << std::endl;
            }

            // if 2nd track is active , check that too
            if (m_trackManager.currentTrackList.size() == 2)
            {
                // delete the output_buffer (it was temp)
                free(output_buffer);
                // check if the track is complete
                if (offset1 == num_chunks1)
                {
                    // close this track, it has ended
                    removeFromCurList(desc_id1);
                    m_trackManager.freeTrackList.push_back(desc_id1);
                    // free up data_buffer
                    free(m_trackManager.openTracks[desc_id0].data_buffer);
                    // std::cout << "closed track" << std::endl;
                }
            }
        }
        else
        {
            // copy 1 chunk of silence
            bool status = false;
            while (!status)
            {
                status = m_ringBuffer->writeChunk((void *)silent_chunk, 1);
                // std::cout << "Copied 1 chunk" << std::endl;
                if (!status)
                {
                    // ring full.. wait
                    // printf ("ring full..\n");
                    // wait 10ms
                    std::this_thread::sleep_for(std::chrono::milliseconds(10));
                }
                else
                {
                    break;
                }
            }
        }
        chunkCnt++;
    }
}

// This function mixes 2 tracks and outputs 1 chunk
// Note: the sample rate and # of channels must be same across the two tracks
void chunkWriter::mixTracksChunk(char *src0_chunkPtr, char *src1_chunkPtr, char *dest_chunkPtr)
{
    int num_samplesPerChunk = m_chunkSize / m_sampleSize;

    char *src0_dataptr = src0_chunkPtr;
    char *src1_dataptr = src1_chunkPtr;
    char *dest_dataptr = dest_chunkPtr;

    for (int sample = 0; sample < num_samplesPerChunk; sample++)
    {
        // read each channel and add them up with saturation
        for (int i = 0; i < m_numChannels; i++)
        {
            if (m_bitsPerSample == 16)
            {
                short sample0 = *(short *)src0_dataptr;
                short sample1 = *(short *)src1_dataptr;
                short output = sample0/2 + sample1/2;
                //output = output/2; // divide by 2
                //if (output > SHRT_MAX)
                //{
                //    // saturate
                //    output = SHRT_MAX;
                //}
                *(short *)dest_dataptr = output;
                dest_dataptr += 2;
                src0_dataptr += 2;
                src1_dataptr += 2;
            }
            else
            {
                assert(false); // TODO: support other formats
            }
        }
    }
}

// void chunkWriter::run_loop_deprecated()
// {

//     int recordCnt = 0;

//     while (m_plan->size() <= recordCnt)
//     {
//         std::this_thread::sleep_for(std::chrono::milliseconds(100));
//         if (m_loopCtrl->stop.load(std::memory_order_relaxed))
//         {
//             return;
//         }
//     }
//     // read first record
//     planRecord_t item = m_plan->readPlanRecord(recordCnt);

//     while (!m_loopCtrl->stop.load(std::memory_order_relaxed))
//     {
//         std::string filePath = item.filePath;
//         // bool first = true;

//         // if this is a new file, open it
//         std::ifstream file(filePath, std::ios::binary | std::ios::ate);
//         std::streamsize size = file.tellg();
//         file.seekg(0, std::ios::beg);
//         std::vector<char> buffer(size);
//         file.read(buffer.data(), size);

//         while (true)
//         {
//             int offset = item.offset;
//             int chunkCnt = 0;
//             while ((chunkCnt < item.length) && !(m_loopCtrl->stop.load(std::memory_order_acquire)))
//             {
//                 bool status;
//                 if (item.format.sampleRate != m_samplesPerSec)
//                 {
//                     status = scaledChunkCopy((size_t)buffer.data() + 44 + (offset + chunkCnt) * m_chunkSize, item.format.sampleRate);
//                 }
//                 else
//                 {
//                     // write one chunk to the ring buffer
//                     status = m_ringBuffer->writeChunk((void *)(buffer.data() + 44 + (offset + chunkCnt) * m_chunkSize), 1);
//                 }
//                 if (status)
//                 {
//                     chunkCnt++;
//                     // printf ("writing chunk to ring buffer %d, %d\n", offset, chunkCnt);
//                 }
//                 else
//                 {
//                     // ring full.. wait
//                     // printf ("ring full..\n");
//                     // wait 10ms
//                     std::this_thread::sleep_for(std::chrono::milliseconds(10));
//                 }
//             }

//             // increment record counter
//             recordCnt++;

//             // check if there is more item in the list
//             while (m_plan->size() <= recordCnt)
//             {
//                 std::this_thread::sleep_for(std::chrono::milliseconds(100));
//                 if (m_loopCtrl->stop.load(std::memory_order_relaxed))
//                 {
//                     file.close();
//                     return;
//                 }
//             }

//             // read the next record
//             item = m_plan->readPlanRecord(recordCnt);
//             if (item.filePath != filePath)
//             {
//                 file.close();
//                 break;
//             }
//         }
//     }
// }

bool chunkWriter::scaledChunkCopy(size_t srcChunkPtr, int sampleRate)
{
    assert(sampleRate < m_samplesPerSec); // can only upscale for now.
    // if there is no space in ringbuffer, return
    if (m_ringBuffer->numFreeChunks() < 2)
        return false;

    // calculate # of samples delta per chunk
    int inputSampleCnt = (sampleRate * 1000) / m_chunkInMs;
    int targetSampleCnt = (m_samplesPerSec * 1000) / m_chunkInMs;

    int inputSamplesLeft = inputSampleCnt;
    int outputSamplesLeft = targetSampleCnt;

    unsigned inputSamplePtr = 0;
    unsigned outputSamplePtr = 0;

    std::ofstream outfilefordiff("upscaled_isaac.txt", std::ofstream::binary);

    while (outputSamplesLeft > 0)
    {

        int delta = outputSamplesLeft - inputSamplesLeft;

        // calculate the ratio of the input sample left vs. output sample left
        if (delta <= 0)
        {
            // just copy the samples and be done
            m_ringBuffer->writeChunkBytes((void *)(srcChunkPtr + inputSamplePtr * m_sampleSize), outputSamplePtr * m_sampleSize, outputSamplesLeft * m_sampleSize);
            outfilefordiff.write((char *)(srcChunkPtr + inputSamplePtr * m_sampleSize), outputSamplesLeft * m_sampleSize);
            outputSamplesLeft = 0;
        }
        else
        {
            int srcSamples = int((double)outputSamplesLeft / (double)delta) - 1;
            assert(srcSamples <= inputSamplesLeft);
            if (srcSamples > 0)
            {
                // printf ("copying %d samples\n", srcSamples);
                //  copy samples
                m_ringBuffer->writeChunkBytes((void *)(srcChunkPtr + inputSamplePtr * m_sampleSize), outputSamplePtr * m_sampleSize, srcSamples * m_sampleSize);
                outfilefordiff.write((char *)(srcChunkPtr + inputSamplePtr * m_sampleSize), srcSamples * m_sampleSize);
                inputSamplesLeft -= srcSamples;
                outputSamplesLeft -= srcSamples;
                inputSamplePtr += srcSamples;
                outputSamplePtr += srcSamples;
            }
            // repeat the last input sample to output.
            // TODO: instead of copy, take avg. of two samples
            if (outputSamplesLeft > 0)
            {
                assert(inputSamplePtr > 0);
                // printf ("copying 1 sample\n");
                //  interpolate
                int16_t ch0, ch1;
                size_t prevChunkPtr = srcChunkPtr + (inputSamplePtr - 1) * m_sampleSize;
                size_t nextChunkPtr = prevChunkPtr + m_sampleSize;
                ch0 = (*(int16_t *)prevChunkPtr + *(int16_t *)nextChunkPtr) / 2;
                ch1 = (*(int16_t *)(prevChunkPtr + 2) + *(int16_t *)(nextChunkPtr + 2)) / 2;

                // m_ringBuffer->writeChunkBytes((void *)(srcChunkPtr + (inputSamplePtr - 1) * m_sampleSize), outputSamplePtr * m_sampleSize, m_sampleSize);
                m_ringBuffer->writeChunkBytes((void *)&ch0, outputSamplePtr * m_sampleSize, 2);
                m_ringBuffer->writeChunkBytes((void *)&ch1, outputSamplePtr * m_sampleSize + 2, 2);
                outfilefordiff.write((char *)&ch0, 2);
                outfilefordiff.write((char *)&ch1, 2);
                outputSamplesLeft--;
                outputSamplePtr++;
            }
        }
    }
    // chunk write complete, update head
    m_ringBuffer->updateHead(1);
    return true;
}
