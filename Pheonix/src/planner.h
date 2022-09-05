// This class creates the "plan" and adds to the plan data structure
#include "thePlan.h"

class planner {
    private:
        ThePlan *m_plan;

    public:
        planner(ThePlan *plan) {
            m_plan = plan;

            audioControl_t audio = {0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0};
            waveFormat_t fmt, fmt1;
            //TODO: 
            // for now, just add a couple of songs with overlapping transition   
            std::string track0, track1, track2, track3;
            track0 = "/Users/siddharth/dev/DJTorsten/Pheonix/src/test-isaac.wav";
            track1 = "/Users/siddharth/Downloads/Falling In Reverse - 'Popular Monster'.wav";   
            track2 = "/Users/siddharth/Downloads/demo-samples/04 - Hip Hop Track Serato Hip Hop Starter Pack.wav";
            track3 = "/Users/siddharth/Downloads/demo-samples/05 - Hip Hop Track Serato Hip Hop Starter Pack.wav";
            fmt.sampleRate = 44100;
            fmt1.sampleRate = 48000; 
            // play track1 @ chunk=3
            // m_plan->addRecordToPlan(0, PLAY, track2, 0, false, audio, fmt1, 1000, 0);
            // std::cout << "added first rec" << std::endl;
            // //stop after 10 seconds (@ chunk=13)
            // m_plan->addRecordToPlan(13, STOP, track1, 0, false, audio, fmt1, 1000, 0);

            // m_plan->addRecordToPlan(16, PLAY, track3, 4, false, audio, fmt1, 1200, 0);
            // m_plan->addRecordToPlan(26, STOP, track3, 0, false, audio, fmt1, 1200, 0);

            m_plan->addRecordToPlan(0, PLAY, track2, 0, false, audio, fmt1, 1000, 0);
            m_plan->addRecordToPlan(4, PLAY, track3, 4, false, audio, fmt1, 1200, 0);
            // start fading out
            // audio.volume = 0.7;
            // m_plan->addRecordToPlan(30, track1, 3, 30, true, audio, fmt1);

            // audio.volume = 0.5;
            // m_plan->addRecordToPlan(31, track0, 31, true, audio);
            // audio.volume = 0.3;
            // m_plan->addRecordToPlan(32, track0, 32, true, audio);
            // audio.volume = 0.1;
            // m_plan->addRecordToPlan(33, track0, 33, true, audio);
            // // 1 chunk of silence
            // audio.volume = 0.0;
            // m_plan->addRecordToPlan(34, track0, 34, true, audio);
            // // start second track
            // audio.volume = 0.1;
            // m_plan->addRecordToPlan(35, track1, 0, true, audio);
            // audio.volume = 0.3;
            // m_plan->addRecordToPlan(36, track1, 1, true, audio);
            // audio.volume = 0.5;
            // m_plan->addRecordToPlan(37, track1, 2, true, audio);
            // audio.volume = 0.7;
            // m_plan->addRecordToPlan(38, track1, 3, true, audio);
            // audio.volume = 0.0;
            // m_plan->addRecordToPlan(39, track1, 4, false, audio);
            // audio.volume = 0.3;
            // m_plan->addRecordToPlan(69, track1, 0, false, audio);

            m_plan->commitPlan();
        }

        ~planner() {
            //nothing...
        }

};
