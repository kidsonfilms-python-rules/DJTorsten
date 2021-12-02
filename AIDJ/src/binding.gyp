{
    "targets": [
        {
            "target_name": "djflame_aidj",
            "sources": ["main.cc", "RingBuffer.cc"],
            "defines": ["WINDOWS_OS"],
            "libraries": ["Winmm.lib"]
        }
    ]
}