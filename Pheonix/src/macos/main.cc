#include <node.h>
#include <thread>
#include <list>
#include <string>

#include <iostream>
#include <fstream>
#include <unistd.h>
#include "AudioToolbox/AudioToolbox.h"

#include "../RingBuffer.h"

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

    typedef struct
    {
        double phase, phase_inc;
        int count;
    } PhaseBlah;

    int tail = 0;

    void callback(void *ptr, AudioQueueRef queue, AudioQueueBufferRef buf_ref)
    {
        OSStatus status;
        PhaseBlah *p = (PhaseBlah *)ptr;
        AudioQueueBuffer *buf = buf_ref;
        int nsamp = buf->mAudioDataByteSize / 2;
        short *samp = (short *)buf->mAudioData;
        int ii;
        // /Users/siddharth/Downloads/Falling In Reverse - 'Popular Monster'.wav
        std::ifstream file("/Users/siddharth/dev/DJTorsten/Pheonix/src/test-isaac.wav", std::ios::binary | std::ios::ate);
        std::streamsize size = file.tellg();
        file.seekg(0, std::ios::beg);
        std::vector<char> buffer(size);
        file.read(buffer.data(), size);

        memcpy((void *)samp, (void *)(buffer.data() + 44 + (tail * 192000)), 11520000);

        file.close();

        printf("Callback! nsamp: %d\n", nsamp);
        // for (ii = 0; ii < nsamp; ii++)
        // {
        //     samp[ii] = (int)(10000.0 * sin(p->phase));
        //     p->phase += p->phase_inc;
        //     //printf("phase: %.3f\n", p->phase);
        // }
        p->count++;
        // jray:
        status = AudioQueueEnqueueBuffer(queue, buf_ref, 0, NULL);
        printf("Enqueue status: %d\n", status);
        printf("tail: %d\n", tail);
        tail += 60;
    }

    void play(const FunctionCallbackInfo<Value> &args)
    {
        std::thread playThread([&]()
                               {
                                   AudioQueueRef queue;
                                   PhaseBlah phase = {0, 2 * 3.14159265359 * 450 / 44100};
                                   OSStatus status;
                                   AudioStreamBasicDescription fmt = {0};
                                   AudioQueueBufferRef buf_ref, buf_ref2, buf_ref3;

                                   fmt.mSampleRate = 44100;
                                   fmt.mFormatID = kAudioFormatLinearPCM;
                                   fmt.mFormatFlags = kAudioFormatFlagIsSignedInteger | kAudioFormatFlagIsPacked;
                                   fmt.mFramesPerPacket = 1;                         // jray: idk
                                   fmt.mChannelsPerFrame = 2;                        // 2 for stereo
                                   fmt.mBytesPerPacket = fmt.mBytesPerFrame = 2 * 2; // x2 for stereo
                                   fmt.mBitsPerChannel = 16;

                                   // jray: creates the audio queue
                                   status = AudioQueueNewOutput(&fmt, callback, &phase, CFRunLoopGetCurrent(),
                                                                kCFRunLoopCommonModes, 0, &queue);

                                   if (status == kAudioFormatUnsupportedDataFormatError)
                                       puts("oops!");
                                   else
                                       printf("NewOutput status: %d\n", status);

                                   // jray: allocate memory of the audio queue
                                   status = AudioQueueAllocateBuffer(queue, 11520000, &buf_ref);
                                   printf("Allocate status: %d\n", status);

                                   AudioQueueBuffer *buf = buf_ref;
                                   printf("buf: %p, data: %p, len: %d\n", buf, buf->mAudioData, buf->mAudioDataByteSize);
                                   buf->mAudioDataByteSize = 11520000;

                                   callback(&phase, queue, buf_ref);

                                   status = AudioQueueAllocateBuffer(queue, 11520000, &buf_ref2);
                                   printf("Allocate2 status: %d\n", status);

                                   status = AudioQueueAllocateBuffer(queue, 11520000, &buf_ref3);
                                   printf("Allocate3 status: %d\n", status);

                                   buf = buf_ref2;
                                   buf->mAudioDataByteSize = 11520000;

                                   callback(&phase, queue, buf_ref2);

                                   buf = buf_ref3;
                                   buf->mAudioDataByteSize = 11520000;
                                   callback(&phase, queue, buf_ref3);

                                   status = AudioQueueSetParameter(queue, kAudioQueueParam_Volume, 1.0);
                                   printf("Volume status: %d\n", status);

                                   status = AudioQueueStart(queue, NULL);
                                   printf("Start status: %d\n", status);
                                   sleep(180);
                               });
        playThread.join();

        // for(int i=0; i<2; i++) {
        //     CFRunLoopRunInMode(
        //         kCFRunLoopDefaultMode,
        //         61, // seconds
        //         false // don't return after source handled
        //     );
        //     printf ("after cfrunloop\n");
        // }
    }

    void start(const FunctionCallbackInfo<Value> &args)
    {
        RingBuffer buffer(185, 1);

        // Prepare Song Library
        std::string library[] = {"/Users/siddharth/dev/DJTorsten/Pheonix/src/test-isaac.wav"};

        // Prepare Node Addon API
        Isolate *isolate = args.GetIsolate();
        Local<Context> context = isolate->GetCurrentContext();
        Local<Function> sendInfoCB = Local<Function>::Cast(args[0]);
        const unsigned argc = 1;

        std::thread playThread([&]()
                               {
                                   std::ifstream file(library[0], std::ios::binary | std::ios::ate);
                                   std::streamsize size = file.tellg();
                                   file.seekg(0, std::ios::beg);
                                   std::vector<char> tempbuffer(size);
                                   if (!file.read(tempbuffer.data(), size))
                                   {
                                       /* !worked! */
                                   }
                                   int currentWriteChunk = 0;
                                   // for (int i = 0; i < size; i += buffer.rawSize(5))
                                   // {
                                   //     buffer.writeChunk((void *)(tempbuffer.data() + i), 5);
                                   //     printf("Writing Chunk %d - %d\n", currentWriteChunk, currentWriteChunk + 5);
                                   //     currentWriteChunk += 5;
                                   // }
                                   std::string command = "afplay /Users/siddharth/dev/DJTorsten/Pheonix/src/test-isaac.wav";
                                   system(command.c_str());
                               });

        playThread.join();
        Local<Value> argv[argc] = {
            String::NewFromUtf8(isolate, "hello world").ToLocalChecked()};
        sendInfoCB->Call(context, Null(isolate), argc, argv).ToLocalChecked();
        printf("%d", buffer.rawSize(180));
    }

    void run_callback(const FunctionCallbackInfo<Value> &args)
    {
        Isolate *isolate = args.GetIsolate();
        Local<Context> context = isolate->GetCurrentContext();
        Local<Function> cb = Local<Function>::Cast(args[0]);
        const unsigned argc = 1;
        Local<Value> argv[argc] = {
            String::NewFromUtf8(isolate, "hello world").ToLocalChecked()};
        cb->Call(context, Null(isolate), argc, argv).ToLocalChecked();
        cb->Call(context, Null(isolate), argc, argv).ToLocalChecked();
    }

    using namespace std;
    void testThreads(const FunctionCallbackInfo<Value> &args)
    {
        struct ThePlan
        {
            int roll_no;
            string name;
        };

        ofstream wf("053467-cache.djf", ios::out | ios::binary);
        if (!wf)
        {
            cout << "Cannot open file!" << endl;
        } else {
        ThePlan wstu[3];
        wstu[0].roll_no = 1;
        wstu[0].name = "Ram";
        wstu[1].roll_no = 2;
        wstu[1].name = "Shyam";
        wstu[2].roll_no = 3;
        wstu[2].name = "Madhu";
        for (int i = 0; i < 3; i++)
            wf.write((char *)&wstu[i], sizeof(Student));
        wf.close();
        if (!wf.good())
        {
            cout << "Error occurred at writing time!" << endl;
        }
        ifstream rf("/Users/siddharth/Library/Application Support/DJFlame/Cache/053467-cache.djf", ios::out | ios::binary);
        if (!rf)
        {
            cout << "Cannot open file!" << endl;
        }
        Student rstu[3];
        for (int i = 0; i < 3; i++)
            rf.read((char *)&rstu[i], sizeof(Student));
        rf.close();
        if (!rf.good())
        {
            cout << "Error occurred at reading time!" << endl;
        }
        cout << "Student's Details:" << endl;
        for (int i = 0; i < 3; i++)
        {
            cout << "Roll No: " << wstu[i].roll_no << endl;
            cout << "Name: " << wstu[i].name << endl;
            cout << endl;
        }
        }
    }

    void Initialize(Local<Object> exports)
    {
        NODE_SET_METHOD(exports, "start", play);
        NODE_SET_METHOD(exports, "testcb", run_callback);
        NODE_SET_METHOD(exports, "testThreads", testThreads);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize);

}