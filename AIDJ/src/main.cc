#include <node.h>

namespace djflame_aidj {
    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::Object;
    using v8::Number;
    using v8::Value;

    void Play(const FunctionCallbackInfo<Value>&args) {

    }

    void Initialize(Local<Object> exports) {
        NODE_SET_METHOD(exports, "play", Play);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize);
}