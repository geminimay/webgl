import { math } from "./math.js"

let canvas;
let height;
let width;
let VertexShader = {
    gl_Position: null,
    gl_PointSize: null,
    attributes: {},
    varyings: {},
    uniforms: {}
}

let FregmentShader = {
    gl_FragColor: null,
    gl_FragCoord: null,
    gl_PointCoord: null,
    varyings: {},
    uniforms: {}
}

let vertexData = {
    vertexAttributes: {},
    vertexUniforms: {},
    vertexVaryings: {},
}
let vertexIndex = []
let fregmentData = {
    fregmentUniforms: {},
    fregmentVaryings: {},
}

let current_buffer = null;
let buffers = []
let current_texture = [];
let texureIndex = 0
let ViewportTransform

let gl = {
    POINTS: "POINTS",
    TRIANGLES: "TRIANGLES",
    GL_LINES: "GL_LINES",
    GL_LINE_STRIP: "GL_LINE_STRIP",
    GL_LINE_LOOP: "GL_LINE_LOOP",
    GL_TRIANGLE_STRIP: "GL_TRIANGLE_STRIP",
    GL_TRIANGLE_FAN: "GL_TRIANGLE_FAN",

    ARRAY_BUFFER: "ARRAY_BUFFER",
    ELEMENT_ARRAY_BUFFER: "ELEMENT_ARRAY_BUFFER",

    viewport: function (ox, oy, w, h) {
        height = h
        width = w
        ViewportTransform = [[width / 2, 0, 0, 0], [0, height / 2, 0, 0], [0, 0, 1, 0], [width / 2, height / 2, 0, 1]]
    },
    getAttribLocation: function (p, a) {
        if (!vertexData.vertexAttributes[a]) {
            vertexData.vertexAttributes[a] = []
        }
        return vertexData.vertexAttributes[a]
    },
    getUniformLocation: function (p, u) {
        if (!vertexData.uniforms[u]) {
            vertexData.uniforms[u] = []
        }
        return vertexData.uniforms[u]
    },

    createBuffer: function () {
        return []
    },

    bindBuffer: function (t, buffer) {
        current_buffer = buffer
    },

    bufferData: function (t, data, draw) {
        if (t == gl.ARRAY_BUFFER) {
            current_buffer.push.apply(current_buffer, data);
        } else if (t == gl.ELEMENT_ARRAY_BUFFER) {
            vertexIndex.push.apply(vertexIndex, data);
        }
    },

    clearColor: function () {

    },
    clear: function () {

    },
    useProgram: function (p) {
        canvas = p.canvas
    },
    enableVertexAttribArray: function () {

    },
    texImage2D: function (type, color, UNSIGNED_BYTE, image) {



    },
    activeTexture: function (index) {
        texureIndex = parseInt(index.substr(index.length - 1, 1))
    },
    bindTexture: function (texture_type, texture) {
        current_texture[0] = texture
    },
    uniform1i: function (uniformLocation, index) {
        uniformLocation = current_texture[index]

    },
    vertexAttribPointer: function (attributeLocation, size, type, normalize, stride, offset) {
        if (size == 2) {
            for (let i = 0; i < current_buffer.length; i += 2) {
                attributeLocation.push([current_buffer[i], current_buffer[i + 1], 0, 1])
            }
        } else if (size == 3) {
            for (let i = 0; i < current_buffer.length; i += 3) {
                attributeLocation.push([current_buffer[i], current_buffer[i + 1], current_buffer[i + 2], 1])
            }
        }
    },

    drawArrays: function (primitiveType, offset, count) {
        this.draw(primitiveType, count, offset, "array")
    },
    drawElements: function (primitiveType, count, type, offset) {
        this.draw(primitiveType, count, offset, "elements")
    },
    draw: function (primitiveType, count, offset, drawType) {
        let zbuffer = []
        const imgData = canvas.createImageData(height, width);
        for (let key in VertexShader.uniforms) {
            VertexShader.uniforms[key] = vertexData.vertexUniforms[key]
        }
        for (let key in FregmentShader.uniforms) {
            FregmentShader.uniforms[key] = fregmentData.fregmentUniforms[key]
        }

        if (primitiveType == gl.POINTS) {
            // iterate each point
            for (let i = offset; i < count; i++) {
                for (let key in VertexShader.attributes) {
                    VertexShader.attributes[key] = vertexData.vertexAttributes[key][i]
                }
                VertexShader.main();
                let size = VertexShader.gl_PointSize

                for (let key in FregmentShader.varyings) {
                    FregmentShader.varyings[key] = VertexShader.varyings[key]
                }

                let point = math.dot(ViewportTransform, [VertexShader.gl_Position])
                let point_n = math.normalize(point)[0]

                FregmentShader.gl_PointCoord = [point_n[0], point_n[1]]
                FregmentShader.main();

                let x_min = Math.round(Math.max(0, point_n[0] - size / 2))
                let x_max = Math.round(Math.min(width, point_n[0] + size / 2))

                let y_min = Math.round(Math.max(0, point_n[1] - size / 2))
                let y_max = Math.round(Math.min(height, point_n[1] + size / 2))

                for (let x = x_min; x <= x_max; x++) {
                    for (let y = y_min; y <= y_max; y++) {
                        let index = ((height - x) * width + y) * 4
                        imgData.data[index] = FregmentShader.gl_FragColor[0] * 255;
                        imgData.data[index + 1] = FregmentShader.gl_FragColor[1] * 255;
                        imgData.data[index + 2] = FregmentShader.gl_FragColor[2] * 255;
                        imgData.data[index + 3] = FregmentShader.gl_FragColor[3] * 255;
                    }
                }
            }

        } else if (primitiveType == gl.GL_LINES || primitiveType == gl.GL_LINE_STRIP || primitiveType == gl.GL_LINE_LOOP) {

            let start, total, step;
            if (primitiveType == gl.GL_LINES) {
                start = offset, total = count, step = 2;
            } else if (primitiveType == gl.GL_LINE_STRIP) {
                start = offset, total = count - 1, step = 1;
            } else if (primitiveType == gl.GL_LINE_LOOP) {
                start = offset, total = count, step = 1;
            }
            let line_info = {
                points: [],
                attributes: {},
                varyings: {}
            }
            for (let key in VertexShader.attributes) {
                line_info.attributes[key] = []
            }
            for (let key in VertexShader.varyings) {
                line_info.varyings[key] = []
            }
            // iterate each line
            for (let i = 0; i < total; i = i + step) {
                // iterate each point of a line
                for (let j = 0; j < 2; j++) {
                    for (let key in VertexShader.attributes) {
                        if (i == total - 1 && j == 1 && primitiveType == gl.GL_LINE_LOOP) {
                            line_info.attributes[key][1] = VertexShader.attributes[key] = vertexData.vertexAttributes[key][start];
                        } else {
                            line_info.attributes[key][j] = VertexShader.attributes[key] = vertexData.vertexAttributes[key][start + i + j];
                        }
                    }
                    VertexShader.main();
                    line_info.points[j] = VertexShader.gl_Position;

                    for (let key in VertexShader.varyings) {
                        line_info.varyings[key][j] = VertexShader.varyings[key];
                    }
                }

                let point = math.dot(ViewportTransform, line_info.points);
                let point_n = math.normalize(point);

                let start_point = point_n[0];
                let end_point = point_n[1];

                let steep = false;

                if (Math.abs(start_point[0] - end_point[0]) < Math.abs(start_point[1] - end_point[1])) {
                    [start_point[0], start_point[1]] = [start_point[1], start_point[0]];
                    [end_point[0], end_point[1]] = [end_point[1], end_point[0]];
                    steep = true;
                }
                if (start_point[0] > end_point[0]) {
                    [start_point[0], end_point[0]] = [end_point[0], start_point[0]];
                    [start_point[1], end_point[1]] = [end_point[1], start_point[1]];
                }
                let y = Math.round(start_point[1]);
                let eps = 0;
                let dx = end_point[0] - start_point[0];
                let dy = end_point[1] - start_point[1];
                let yi = 1;
                if (dy < 0) {
                    yi = -1;
                    dy = -dy;
                }
                let index;
                start_point[0] = Math.round(start_point[0]);
                end_point[0] = Math.round(end_point[0]);

                for (let x = start_point[0]; x < end_point[0]; x++) {
                    if (steep) {
                        index = ((height - x) * width + y) * 4;
                    } else {
                        index = (width * (height - y) + x) * 4;
                    }
                    FregmentShader.main();
                    imgData.data[index] = FregmentShader.gl_FragColor[0] * 255;
                    imgData.data[index + 1] = FregmentShader.gl_FragColor[1] * 255;
                    imgData.data[index + 2] = FregmentShader.gl_FragColor[2] * 255;
                    imgData.data[index + 3] = FregmentShader.gl_FragColor[3] * 255;
                    eps += dy
                    if (eps * 2 >= dx) {
                        y = y + yi;
                        eps -= dx;
                    }
                }
            }
        }
        else if (primitiveType == gl.TRIANGLES || primitiveType == gl.GL_TRIANGLE_STRIP || primitiveType == gl.GL_TRIANGLE_FAN) {
            let triangle_info = {
                points: [],
                attributes: {},
                varyings: {}
            }
            for (let key in VertexShader.attributes) {
                triangle_info.attributes[key] = []
            }
            for (let key in VertexShader.varyings) {
                triangle_info.varyings[key] = []
            }

            let start, total, step;
            if (primitiveType == gl.TRIANGLES) {
                start = offset, total = count, step = 3;
            } else if (primitiveType == gl.GL_TRIANGLE_STRIP) {
                start = offset, total = count - 2, step = 1;
            } else if (primitiveType == gl.GL_TRIANGLE_FAN) {
                start = offset, total = count - 2, step = 1;
                for (let key in VertexShader.attributes) {
                    triangle_info.attributes[key][0] = VertexShader.attributes[key] = vertexData.vertexAttributes[key][start]
                }
                VertexShader.main();
                triangle_info.points[0] = VertexShader.gl_Position
                for (let key in VertexShader.varyings) {
                    triangle_info.varyings[key][0] = VertexShader.varyings[key]
                }
            }

            let cache_position = []
            if (drawType == "elements") {
                for (let k = 0; k < vertexIndex.length; k++) {
                    if (!cache_position[vertexIndex[k]]) {
                        for (let key in VertexShader.attributes) {
                            VertexShader.attributes[key] = vertexData.vertexAttributes[key][vertexIndex[k]]
                        }
                        VertexShader.main();
                        cache_position[vertexIndex[k]] = VertexShader.gl_Position
                    }
                }
            }

            // iterate each triangle
            for (let i = 0; i < total; i = i + step) {
                // iterate each point of a triangle
                let j_start = 0
                if (primitiveType == gl.GL_TRIANGLE_FAN) {
                    j_start = 1
                }
                if (drawType == "array") {
                    for (let j = j_start; j < 3; j++) {
                        for (let key in VertexShader.attributes) {
                            triangle_info.attributes[key][j] = VertexShader.attributes[key] = vertexData.vertexAttributes[key][start + i + j]
                        }
                        VertexShader.main();
                        triangle_info.points[j] = VertexShader.gl_Position
                        for (let key in VertexShader.varyings) {
                            triangle_info.varyings[key][j] = VertexShader.varyings[key]
                        }
                    }
                } else if (drawType == "elements") {
                    for (let j = j_start; j < 3; j++) {
                        for (let key in VertexShader.attributes) {
                            triangle_info.attributes[key][j] = VertexShader.attributes[key] = vertexData.vertexAttributes[key][start + i + j]
                        }
                        VertexShader.main();
                        triangle_info.points[j] = cache_position[vertexIndex[start + i + j]]
                        for (let key in VertexShader.varyings) {
                            triangle_info.varyings[key][j] = VertexShader.varyings[key]
                        }
                    }
                }

                // viewport transform
                let pts = math.dot(ViewportTransform, triangle_info.points)
                // standardize
                let pts2 = math.normalize(pts)

                let x_min = Number.MAX_VALUE
                let x_max = Number.MIN_VALUE

                let y_min = Number.MAX_VALUE
                let y_max = Number.MIN_VALUE

                for (let k = 0; k < 3; k++) {
                    x_min = Math.min(x_min, pts2[k][0])
                    x_max = Math.max(x_max, pts2[k][0])

                    y_min = Math.min(y_min, pts2[k][1])
                    y_max = Math.max(y_max, pts2[k][1])
                }
                x_min = Math.round(Math.max(0, x_min))
                y_min = Math.round(Math.max(0, y_min))

                x_max = Math.round(Math.min(x_max, width))
                y_max = Math.round(Math.min(y_max, height))

                // iterate each pixel
                for (let x = x_min; x <= x_max; x++) {
                    for (let y = y_min; y <= y_max; y++) {
                        // compute barycenter of a triangle
                        let bc_screen = math.barycentric(pts2, [x, y]);

                        if (bc_screen[0] < 0 || bc_screen[1] < 0 || bc_screen[2] < 0) continue;

                        for (let key in FregmentShader.varyings) {
                            FregmentShader.varyings[key] = multily(add([VertexShader.varyings[key][0], VertexShader.varyings[key][1], VertexShader.varyings[key][2]]), bc_clip)
                        }
                        FregmentShader.gl_FragCoord = [x, y]
                        FregmentShader.main();
                        let index = (width * (height - y) + x) * 4;
                        imgData.data[index] = FregmentShader.gl_FragColor[0] * 255;
                        imgData.data[index + 1] = FregmentShader.gl_FragColor[1] * 255;
                        imgData.data[index + 2] = FregmentShader.gl_FragColor[2] * 255;
                        imgData.data[index + 3] = FregmentShader.gl_FragColor[3] * 255;
                    }
                }
            }
        }
        canvas.putImageData(imgData, 0, 0);
    }
}



export {
    gl, VertexShader, FregmentShader
}