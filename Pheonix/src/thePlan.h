#ifndef __THE_PLAN__
#define __THE_PLAN__

#include <assert.h>
#include <vector>
#include <iostream>
#include <fstream>
#include <atomic>

// This class contains the "plan" - which is the list of tracks 
//  to be played (per chunk), audio control (base, volume, treble)

// DJF FILE STRUCTURE
// BYTES 0-69 -- HEADER
// BYTES 70-END -- BODY
//
// HEADER STRUCTURE
// ------------------
// byte  |  data name
// ------------------
// 0 - Mutable? 1 when yes (DJF cache) and when 0 no (exported DJF file to play in the future) 
// 1-4 - DJFlame Plan Intrepter version, used to insure compatibility
// 5 - 

// List of commands
enum planCommand_e {
    PLAY=0,  //play a track
    STOP,    //stop playing a track
    PAUSE,   //pause a track
    ADJUST_VOL,     //change volume
    ADJUST_BAND,     //adjust band (bass, treble etc.)
    JUMBO_CMD
};

typedef struct {
    float volume; //vol scale factor
    // scale factor for freq bands 
    float bass, treble, subbass, lowmid;
    float mid, upmid, presence, brilliance;
} audioControl_t;

typedef struct {
    unsigned channels;
    unsigned bitsPerSample;
    unsigned sampleRate;
    int chunkSizeBytes(int chunk_in_ms) {
        return (chunk_in_ms * channels * sampleRate * (bitsPerSample / 8)) / 1000;
    }
} waveFormat_t;

// struct for a record (command) in the Plan
// Not all fields will be valid for all commands. see notes
typedef struct
{
    int chunk;                // chunk # for this record
    planCommand_e command;    // command
    std::string filePath;      // path to file 
    int trackId;              // Track ID number
    int offset;               // offset chunk # in to the song 
    bool overrideControl;      // override control info or use default
    audioControl_t chunkControls;   // control info for this chunk
    waveFormat_t   format;
    int jumbo_cmd_length;      // number of commands to follow for a jumbo cmd
} planRecord_t;


class ThePlan {
    private:
        std::vector<planRecord_t> m_planRecords;
        std::atomic_int m_numRecords; //atomic business to make this safe for multi-threading
        std::ofstream m_planFile;

    public:
        //constructor
        ThePlan(std::string cached_filename, bool use_cached_file) {
            assert (!use_cached_file); // TODO: if use_cached_file is set, load existing records

            m_planFile.open(cached_filename, std::ios_base::out | std::ios_base::ate | std::ios_base::binary);
            m_numRecords.store(0, std::memory_order_release);
        }

        ~ThePlan() {
            m_planFile.close();
        }

        void commitPlan() 
        {
            m_numRecords.store(m_planRecords.size(), std::memory_order_release);
        }

        void writeRecordToFile(planRecord_t record)
        {
            //TODO
        }

        // add a new record to the plan
        void addRecordToPlan(int chunk, planCommand_e cmd, std::string file_path, int chunk_offset, bool override_control, 
                             audioControl_t control_info, waveFormat_t format, int track_id, int jumbo_cmd_len) {
            planRecord_t r;
            r.chunk = chunk;
            r.command = cmd;
            r.filePath = file_path;
            r.offset = chunk_offset;
            r.overrideControl = override_control;
            r.chunkControls = control_info;
            r.format = format;
            r.trackId = track_id;
            r.jumbo_cmd_length = jumbo_cmd_len;
            m_planRecords.push_back(r);
            writeRecordToFile(r);
        }

        planRecord_t readPlanRecord(int index)
        {
            assert(static_cast<size_t>(index) < m_planRecords.size());
            return m_planRecords[index];
        }

        void flushPlanFile(void) {
            // flush the plan file content to disk
            m_planFile.flush();
        }

        int size(void) {
            return m_numRecords.load(std::memory_order_acquire); 
        }
};

#endif