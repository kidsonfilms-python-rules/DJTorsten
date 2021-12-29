#include <node.h>
#include <thread>
#include <list>
#include <string>

#include <iostream>
#include <fstream>
#include <unistd.h>
#include "AudioToolbox/AudioToolbox.h"

#include "../RingBuffer.h"
#include "../planner.h"
#include "../chunkWriter.h"
#include "../iCAN.h"

namespace djflame_aidj_macos
{
    using v8::Context;
    using v8::Exception;
    using v8::Function;
    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::Number;
    using v8::Object;
    using v8::String;
    using v8::Value;


void start(const FunctionCallbackInfo<Value> &args)
{

    playloopControl_t loopctrl;
    loopctrl.stop.store(false, std::memory_order_release);

    ThePlan *my_plan = new ThePlan ("junk.djf", false);
    planner my_planner(my_plan);
    chunkWriter my_writer(my_plan, &loopctrl, 1000*16, 1000, 2, 16, 44100);
    RingBuffer *my_ringbuf = my_writer.ring();
    // create the iCAN object (player)
    iCAN my_iCan(my_ringbuf, &loopctrl, 1000, 2, 16, 44100);
    // launch a new thread for playing the ring buffer content
    std::thread playThread([&]()
    {
        my_iCan.run_loop();
    });
    my_writer.run_loop();

    // sleep for 10secs, then stop the players
    std::this_thread::sleep_for(std::chrono::milliseconds(20*1000));
    loopctrl.stop.store(true, std::memory_order_release);
    playThread.join(); //wait for player to finish
}
    

    void Initialize(Local<Object> exports)
    {
        NODE_SET_METHOD(exports, "start", start);
        // NODE_SET_METHOD(exports, "testcb", run_callback);
        // NODE_SET_METHOD(exports, "testThreads", testThreads);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize);

}