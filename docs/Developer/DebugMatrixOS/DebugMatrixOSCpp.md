---
sidebar_position: 1
---

# Debug Matrix OS (C++)


## Enable Debug in Matrix OS
To enable debug in Matrix OS. You will need to first build Matrix OS in debug mode.

In the Matrix OS source folder run
> make DEVICE=Mystrix **build-dev** uf2-upload

Then logging will be enabled on both USB and hardware UART on the device. 

## Send Debug Logs

You can use MLOG* macros or MatrixOS::Logging:Log* functions for sending out debug logs from your code. See [Logging API](/docs/Developer/MatrixOSApplicationCppAPI/Logging)