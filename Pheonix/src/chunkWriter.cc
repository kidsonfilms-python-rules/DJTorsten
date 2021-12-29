#include "chunkWriter.h"
#include <thread>
#include <chrono>

void chunkWriter::run_loop()
{

    // for testing, just play 20 chunks from first entry
    while (m_plan->size() == 0)
    {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    planRecord_t item = m_plan->readPlanRecord(0);
    //bool first = true;
    
    std::ifstream file(item.filePath, std::ios::binary | std::ios::ate);
    std::streamsize size = file.tellg();
    file.seekg(0, std::ios::beg);
    std::vector<char> buffer(size);
    file.read(buffer.data(), size);

    //memcpy((void *)buf->mAudioData, (void *)(buffer.data() + 44), m_chunkSize);
    int count=0;
    while (count < 10) {
        if (m_ringBuffer->numFreeChunks() > 0) {
            // write one chunk to the ring buffer
            bool status = m_ringBuffer->writeChunk((void *)(buffer.data() + 44 + count*m_chunkSize), 1);
            assert(status);
            count++;
        } else {
            //wait 10ms
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
        }
    }

}
