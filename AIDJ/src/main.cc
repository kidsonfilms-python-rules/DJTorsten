#include <node.h>

#include "ICRingBuffer.h"

#ifdef WINDOWS_OS
#include <iostream>
#include <fstream>
#include <windows.h>
#include <mmsystem.h>
#include <stdio.h>
#endif

namespace djflame_aidj
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
        // int sizeBytes = 1024 * 1024;
        // unsigned char *data = new unsigned char[sizeBytes];
        // memset(data, 0, sizeBytes);
        // free(data);

        Isolate *isolate = args.GetIsolate();
        Local<Context> context = isolate->GetCurrentContext();
        Local<Function> dcb = Local<Function>::Cast(args[0]);
        const unsigned argc = 1;

        // C:\\Users\\Siddharth Ray\\Downloads\\A Good Song Never Dies.wav - ~1:00
        // C:\\Users\\Siddharth Ray\\Desktop\\Project DJTorsten\\AIDJ\\src\\test-isaac.wav - ~0:59 (or about 1 minute)
        std::ifstream file("C:\\Users\\Siddharth Ray\\Downloads\\A Good Song Never Dies.wav", std::ios::binary | std::ios::ate);
        std::streamsize size = file.tellg();
        file.seekg(0, std::ios::beg);

        std::vector<char> buffer(size);
        if (file.read(buffer.data(), size))
        {
            /* worked! */
        }
        // for (int i=0;i<44;i++) {
        //     printf("[%d]: %u \n", i+1, buffer[i]);
        // }
        printf("============= AUDIO INFO =============\nChannels: %d\nSamples/s: %d\nAverage Bytes/s: %d\nBlock Align: %d\n======================================\n", *(short *)(buffer.data() + 22), *(int *)(buffer.data() + 24), *(int *)(buffer.data() + 28), *(short *)(buffer.data() + 32));
        // printf("size of buffer: %d\n", (int)sizeof(buffer.data()));
        // bool result = PlaySound("C:\\Users\\Siddharth Ray\\Desktop\\Project DJTorsten\\AIDJ\\src\\test-isaac.wav", NULL, SND_SYNC);
        HWAVEOUT hWaveOut = 0;
        WAVEFORMATEX wfx = {WAVE_FORMAT_PCM, *(short *)(buffer.data() + 22), *(int *)(buffer.data() + 24), *(int *)(buffer.data() + 28), *(short *)(buffer.data() + 32), 16, 0};

        waveOutOpen(&hWaveOut, WAVE_MAPPER, &wfx, 0, 0, CALLBACK_NULL);
        // char buffer[4000 * 60] = {};

        // See http://goo.gl/hQdTi
        // for (DWORD t = 0; t < sizeof(buffer); ++t)
        //     buffer[t] = static_cast<char>((((t * (t >> 8 | t >> 9) & 46 & t >> 8)) ^ (t & t >> 13 | t >> 6)) & 0xFF);

        WAVEHDR header = {buffer.data() + 44, size - 44, 0, 0, 0, 1, 0, 0};
        waveOutPrepareHeader(hWaveOut, &header, sizeof(WAVEHDR));
        waveOutWrite(hWaveOut, &header, sizeof(WAVEHDR));
        waveOutUnprepareHeader(hWaveOut, &header, sizeof(WAVEHDR));
        waveOutClose(hWaveOut);
        Sleep(202 * 1000);
        printf("SONG 1 DONE");
        Local<Value> argv[argc] = {
            String::NewFromUtf8(isolate, "hello world").ToLocalChecked()};
        dcb->Call(context, Null(isolate), argc, argv).ToLocalChecked();
        // waveOutOpen(1, 0, &m_waveFormat, (DWORD)1, 0, CALLBACK_EVENT);
        //  waveOutWrite(0, pwh, cbwh);
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

    void Initialize(Local<Object> exports)
    {
        NODE_SET_METHOD(exports, "start", start);
        NODE_SET_METHOD(exports, "testcb", run_callback);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize);
}