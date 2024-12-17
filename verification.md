# Verification
Just in case, to verify this code isn't tampered with (which can expose you to well, not good stuff) please use the RSA algorithm to verify. The public key is:

*(Last updated for version 0.2.0-alpha)*
```base64
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCLds1mSC1YIhvC5qsMADhPOqt3
a9X4FvVnQE6Z9O3hUSrbHI3OqxC/7oNC4I749cMl5qQxLQYSQMpcsgrFh4Kbva4w
jK4x/Y14AzhMo0yaBJO/3WuqugTXKycPQfEtSmD9yRK/bSb26DDsVpl/hC04T1O6
cVNMZX5Fk552AqWEIQIDAQAB
-----END PUBLIC KEY-----
```

The signature is:
```
XD9Xq1J//5JVL/KBiYwWTGgLnKXnzM0TV44g1euceP5ubs+5WQ1DFIbWCgRzKlZZ9iq6YCM9TjkHMkZ9gO+aW1GzT+rBETx4/R+dLS53T0uUnTpJic7wHFfvOo9UVMuup+EC/gUU6OtALzbh/CbNm5duizxAw88IjSxqdpn4tPM=
```

And don't forget, make sure you also zip the repository (exclude the .git folder) you cloned and then base64 the zip file. Then, put it into an RSA verifier. If it's valid, you're good to go. Or build at your own risk as some forks may contain malicious content.