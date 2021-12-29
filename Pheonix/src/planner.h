// This class creates the "plan" and adds to the plan data structure
#include "thePlan.h"

class planner {
    private:
        ThePlan *m_plan;

    public:
        planner(ThePlan *plan) {
            m_plan = plan;

            audioControl_t audio = {0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0};
            //TODO: 
            // for now, just add a couple of songs with overlapping transition   
            std::string track0, track1;
            track0 = "/Users/siddharth/dev/DJTorsten/Pheonix/src/test-isaac.wav";
            track1 = "/Users/siddharth/Downloads/Falling In Reverse - 'Popular Monster'.wav";     
            m_plan->addRecordToPlan(0, track0, 0, false, audio);
            // start fading out
            audio.volume = 0.7;
            m_plan->addRecordToPlan(30, track0, 30, true, audio);
            audio.volume = 0.5;
            m_plan->addRecordToPlan(31, track0, 31, true, audio);
            audio.volume = 0.3;
            m_plan->addRecordToPlan(32, track0, 32, true, audio);
            audio.volume = 0.1;
            m_plan->addRecordToPlan(33, track0, 33, true, audio);
            // 1 chunk of silence
            audio.volume = 0.0;
            m_plan->addRecordToPlan(34, track0, 34, true, audio);
            // start second track
            audio.volume = 0.1;
            m_plan->addRecordToPlan(35, track1, 0, true, audio);
            audio.volume = 0.3;
            m_plan->addRecordToPlan(36, track1, 1, true, audio);
            audio.volume = 0.5;
            m_plan->addRecordToPlan(37, track1, 2, true, audio);
            audio.volume = 0.7;
            m_plan->addRecordToPlan(38, track1, 3, true, audio);
            audio.volume = 0.0;
            m_plan->addRecordToPlan(39, track1, 4, false, audio);
            audio.volume = 0.3;
            m_plan->addRecordToPlan(69, track1, 0, false, audio);
            m_plan->commitPlan();
        }

        ~planner() {
            //nothing...
        }

};
