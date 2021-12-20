#include <node.h>
#include <thread>
#include <list>

#include <iostream>
#include <fstream>

#include <windows.h>
#include <mmsystem.h>
#include <stdio.h>

#include "../RingBuffer.h"

namespace djflame_aidj_win32
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

    // void startdep(const FunctionCallbackInfo<Value> &args)
    // {
    //     // int sizeBytes = 1024 * 1024;
    //     // unsigned char *data = new unsigned char[sizeBytes];
    //     // memset(data, 0, sizeBytes);
    //     // free(data);

    //     Isolate *isolate = args.GetIsolate();
    //     Local<Context> context = isolate->GetCurrentContext();
    //     Local<Function> dcb = Local<Function>::Cast(args[0]);
    //     const unsigned argc = 1;

    //     // C:\\Users\\Siddharth Ray\\Downloads\\A Good Song Never Dies.wav - ~1:00
    //     // C:\\Users\\Siddharth Ray\\Desktop\\Project DJTorsten\\AIDJ\\src\\test-isaac.wav - ~0:59 (or about 1 minute)
    //     std::ifstream file("C:\\Users\\Siddharth Ray\\Downloads\\A Good Song Never Dies.wav", std::ios::binary | std::ios::ate);
    //     std::streamsize size = file.tellg();
    //     file.seekg(0, std::ios::beg);

    //     // test ring buffer
    //     RingBuffer r0(204, 1);
    //     printf("'hi 1'\n");

    //     std::vector<char> buffer(size);
    //     if (file.read(buffer.data(), size))
    //     {
    //         /* worked! */
    //     }

    //     bool worked = r0.writeChunk((void *)(buffer.data() + 44), 120);

    //     printf("Did the write work? %d\n", worked);
    //     printf("head: %d\n", r0.head());
    //     printf("tail: %d\n", r0.tail());

    //     worked = r0.writeChunk((void *)(buffer.data() + r0.rawSize(120) + 44), 50);
    //     printf("Did the write work? %d\n", worked);
    //     printf("head: %d\n", r0.head());
    //     printf("tail: %d\n", r0.tail());

    //     char *bDATA = r0.readChunk(10);

    //     for (int i = 0; i < 44; i++)
    //     {
    //         printf("[%d]: %u -> %u \n", i + 1, bDATA[i], buffer[i + 44]);
    //     }

    //     // copy song data to ring buffer

    //     printf("%d\n%d\n%d\n", *(int *)(buffer.data() + 24), *(int *)(buffer.data() + 28), *(short *)(buffer.data() + 32));

    //     printf("============= AUDIO INFO =============\nChannels: %d\nSamples/s: %d\nAverage Bytes/s: %d\nBlock Align: %d\n======================================\n", *(short *)(buffer.data() + 22), *(int *)(buffer.data() + 24), *(int *)(buffer.data() + 28), *(short *)(buffer.data() + 32));
    //     // bool result = PlaySound("C:\\Users\\Siddharth Ray\\Desktop\\Project DJTorsten\\AIDJ\\src\\test-isaac.wav", NULL, SND_SYNC);
    //     HWAVEOUT hWaveOut = 0;
    //     WAVEFORMATEX wfx = {WAVE_FORMAT_PCM, 2, 48000, 192000, 4, 16, 0};

    //     waveOutOpen(&hWaveOut, WAVE_MAPPER, &wfx, 0, 0, CALLBACK_NULL);
    //     // char buffer[4000 * 60] = {};

    //     // See http://goo.gl/hQdTi
    //     // for (DWORD t = 0; t < sizeof(buffer); ++t)
    //     //     buffer[t] = static_cast<char>((((t * (t >> 8 | t >> 9) & 46 & t >> 8)) ^ (t & t >> 13 | t >> 6)) & 0xFF);

    //     printf("buffer size: %d\n", r0.rawSize(123));
    //     printf("temp buffer size: %d\n", size - 44);

    //     WAVEHDR header = {bDATA, r0.rawSize(10), 0, 0, 0, 1, 0, 0};
    //     WAVEHDR header2 = {r0.readChunk(10), r0.rawSize(10), 0, 0, 0, 1, 0, 0};
    //     WAVEHDR header3 = {r0.readChunk(10), r0.rawSize(10), 0, 0, 0, 1, 0, 0};
    //     printf("hedr prepared\n");
    //     waveOutPrepareHeader(hWaveOut, &header, sizeof(WAVEHDR));
    //     waveOutPrepareHeader(hWaveOut, &header2, sizeof(WAVEHDR));
    //     waveOutPrepareHeader(hWaveOut, &header3, sizeof(WAVEHDR));
    //     printf("hedr prepared\n");
    //     waveOutWrite(hWaveOut, &header, sizeof(WAVEHDR));
    //     waveOutWrite(hWaveOut, &header2, sizeof(WAVEHDR));
    //     waveOutWrite(hWaveOut, &header3, sizeof(WAVEHDR));
    //     printf("hedr prepared\n");
    //     waveOutUnprepareHeader(hWaveOut, &header, sizeof(WAVEHDR));
    //     // waveOutUnprepareHeader(hWaveOut, &header2, sizeof(WAVEHDR));
    //     // waveOutUnprepareHeader(hWaveOut, &header3, sizeof(WAVEHDR));
    //     printf("hedr prepared\n");
    //     waveOutClose(hWaveOut);
    //     Sleep(34 * 1000);

    //     printf("SONG 1 DONE");
    //     Local<Value> argv[argc] = {
    //         String::NewFromUtf8(isolate, "hello world").ToLocalChecked()};
    //     dcb->Call(context, Null(isolate), argc, argv).ToLocalChecked();
    // }

    void start(const FunctionCallbackInfo<Value> &args)
    {
        // ----------------------------------------
        //                  PREPARE
        // ----------------------------------------

        // Create and Allocate Ring Buffer
        RingBuffer buffer(350, 1);

        // Prepare Song Library
        std::string library[] = {"C:\\Users\\Siddharth Ray\\Downloads\\A Good Song Never Dies.wav"};

        // Prepare Node Addon API
        Isolate *isolate = args.GetIsolate();
        Local<Context> context = isolate->GetCurrentContext();
        Local<Function> sendInfoCB = Local<Function>::Cast(args[0]);
        const unsigned argc = 1;

        // ----------------------------------------
        //                WRITE THREAD
        // ----------------------------------------

        std::thread writeThread([&](){
            std::ifstream file(library[0], std::ios::binary | std::ios::ate);
            std::streamsize size = file.tellg();
            file.seekg(0, std::ios::beg);
            std::vector<char> tempbuffer(size);
            if (!file.read(tempbuffer.data(), size))
            {
                /* !worked! */
            }
            int currentWriteChunk = 0;
            for (int i = 0; i < size; i += buffer.rawSize(5))
            {
                buffer.writeChunk((void *)(tempbuffer.data() + i), 5);
                printf("Writing Chunk %d - %d\n", currentWriteChunk, currentWriteChunk + 5);
                currentWriteChunk += 5;
            }
        });

        // ----------------------------------------
        //                 PLAY THREAD
        // ----------------------------------------
        std::thread playThread([&](){
            printf("Read Thread Started\n");
            // HWAVEOUT hWaveOut = 0;
            // WAVEFORMATEX wfx = {WAVE_FORMAT_PCM, 2, 48000, 192000, 4, 16, 0};

            // auto output = waveOutOpen(&hWaveOut, WAVE_MAPPER, &wfx, 0, 0, CALLBACK_NULL);

            // if (output == MMSYSERR_ALLOCATED) {
            //     printf("1");
            // } else if (output == MMSYSERR_BADDEVICEID) {
            //     printf("2");
            // } else if (output == MMSYSERR_NODRIVER) {
            //     printf("3");
            // } else if (output == MMSYSERR_NOMEM) {
            //     printf("4");
            // } else if (output == WAVERR_BADFORMAT) {
            //     printf("5");
            // } else if (output == WAVERR_SYNC) {
            //     printf("6");
            // } else if (output == NULL) {
            //     printf("null");
            // } else {
            //     printf("unknown mf");
            // }

            bool shouldBePlaying = true;

            while (shouldBePlaying = true)
            {
                printf("Attempting Read\n");
                char * chunkData = buffer.readChunk(5);
                if (chunkData == NULL) {
                    // printf("Read Failed\n");
                    Sleep(0.5);
                } else {
                    // WAVEHDR header = {chunkData, buffer.rawSize(5), 0, 0, 0, 1, 0, 0};
                    // waveOutPrepareHeader(hWaveOut, &header, sizeof(WAVEHDR));
                    // waveOutWrite(hWaveOut, &header, sizeof(WAVEHDR));
                    printf("read worked\n");
                }
            }

            // waveOutClose(hWaveOut);
        });

        writeThread.join();
        playThread.join();
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

    void testThreads(const FunctionCallbackInfo<Value> &args)
    {
        printf("starting Threads\n");
        std::thread thr1([]()
                         {
                             Sleep(20 * 1000);
                             printf("slept for 20 seconds\n");
                         });
        std::thread thr3([]()
                         {
                             Sleep(30 * 1000);
                             printf("slept for 30 seconds\n");
                         });
        std::thread thr2([]()
                         {
                             Sleep(10 * 1000);
                             printf("slept for 10 seconds\n");
                         });

        thr1.join();
        thr3.join();
        thr2.join();
    }

    void Initialize(Local<Object> exports)
    {
        NODE_SET_METHOD(exports, "start", start);
        NODE_SET_METHOD(exports, "testcb", run_callback);
        NODE_SET_METHOD(exports, "testThreads", testThreads);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize);
}