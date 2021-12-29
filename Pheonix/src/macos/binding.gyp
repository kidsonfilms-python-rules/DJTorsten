{
    "targets": [
        {
            "target_name": "djflame_aidj_macos",
            "sources": ["main.cc", "../RingBuffer.cc", "../chunkWriter.cc", "../iCAN.cc"],
            "libraries": ["AudioToolbox.framework"],
            "define": ["__COREAUDIO_USE_FLAT_INCLUDES__", "macos"]
        }
    ]
}