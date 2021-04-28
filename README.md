## Asymphost

Asymphost is a simple tool I threw together for my husband, Kevin, who needs to be able to quickly share compiled Asymptote with others. Simply paste some Asymptote into the text-area, hit submit, and receive a URL in return (or error output, if something's gone awry somewhere). This tool only works for files which can be compiled to either HTML or SVG.

There are two options available:

- 'Delete after 1 hour', which causes the file to be automatically deleted after an hour. This is selected by default.
- 'Modify HTML for sandboxed embedding', as requested by Kevin, which replaces references to 'window.top' for embedding in environments with particular same-origin policies. This is not selected by default.
