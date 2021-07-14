
let math = {
    barycentric: function (pts, P) {
        let x = [pts[1][0] - pts[0][0], pts[2][0] - pts[0][0], pts[0][0] - P[0]]
        let y = [pts[1][1] - pts[0][1], pts[2][1] - pts[0][1], pts[0][1] - P[1]]
        let u = this.cross(x, y)
        if (Math.abs(u[2]) < 1) {
            return [-1, 1, 1]
        }
        return [1 - (u[0] + u[1]) / u[2], u[0] / u[2], u[1] / u[2]]
    },

    dot: function (mat_a, mat_b) {
        if (mat_a.length != mat_b[0].length) {
            throw Error()
        }

        var a = new Array(mat_b.length);
        for (var i = 0; i < mat_b.length; i++) {
            a[i] = new Array(mat_a[0].length).fill(0);
        }

        for (let i = 0; i < mat_a[0].length; i++) {
            for (let j = 0; j < mat_b.length; j++) {
                for (let k = 0; k < mat_a.length; k++) {
                    a[j][i] += (mat_a[k][i] * mat_b[j][k])
                }
            }
        }
        return a
    },

    cross: function (mat_a, mat_b) {
        let mat_result = []
        mat_result[0] = mat_a[1] * mat_b[2] - mat_a[2] * mat_b[1]
        mat_result[1] = mat_a[2] * mat_b[0] - mat_a[0] * mat_b[2]
        mat_result[2] = mat_a[0] * mat_b[1] - mat_a[1] * mat_b[0]
        return mat_result
    },
    add: function (vec_arr) {
        let res = []
        for (let i = 0; i < vec_arr[0].length; i++) {
            for (let j = 0; j < vec_arr.length; j++) {
                res[i] += (vec_arr[j][i])
            }
        }
        return res
    },
    multily: function (vec, n) {
        let res = []
        for (let i = 0; i < vec_arr[0].length; i++) {
            res[i] = vec[i] * n
        }
        return res
    },
    normalize: function (mat) {
        var a = new Array(mat.length);
        for (var i = 0; i < mat.length; i++) {
            a[i] = new Array(mat[0].length).fill(0);
        }
        for (let i = 0; i < mat.length; i++) {
            for (let j = 0; j < mat[0].length; j++) {
                a[i][j] = mat[i][j] / mat[i][mat[0].length - 1]
            }
        }
        return a
    }
}

export {
    math
}