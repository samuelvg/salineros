/*
 * Raphael 1.5.2 - JavaScript Vector Library
 *
 * Copyright (c) 2010 Dmitry Baranovskiy (http://raphaeljs.com)
 * Licensed under the MIT (http://raphaeljs.com/license.html) license.
 */
(function () {
  function a() {
    if (a.is(arguments[0], G)) {
      var b = arguments[0],
        d = bV[m](a, b.splice(0, 3 + a.is(b[0], E))),
        e = d.set();
      for (var g = 0, h = b[w]; g < h; g++) {
        var i = b[g] || {};
        c[f](i.type) && e[L](d[i.type]().attr(i));
      }
      return e;
    }
    return bV[m](a, arguments);
  }
  a.version = "1.5.2";
  var b = /[, ]+/,
    c = { circle: 1, rect: 1, path: 1, ellipse: 1, text: 1, image: 1 },
    d = /\{(\d+)\}/g,
    e = "prototype",
    f = "hasOwnProperty",
    g = document,
    h = window,
    i = { was: Object[e][f].call(h, "Raphael"), is: h.Raphael },
    j = function () {
      this.customAttributes = {};
    },
    k,
    l = "appendChild",
    m = "apply",
    n = "concat",
    o = "createTouch" in g,
    p = "",
    q = " ",
    r = String,
    s = "split",
    t =
      "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend orientationchange touchcancel gesturestart gesturechange gestureend"[
        s
      ](q),
    u = {
      mousedown: "touchstart",
      mousemove: "touchmove",
      mouseup: "touchend",
    },
    v = "join",
    w = "length",
    x = r[e].toLowerCase,
    y = Math,
    z = y.max,
    A = y.min,
    B = y.abs,
    C = y.pow,
    D = y.PI,
    E = "number",
    F = "string",
    G = "array",
    H = "toString",
    I = "fill",
    J = Object[e][H],
    K = {},
    L = "push",
    M = /^url\(['"]?([^\)]+?)['"]?\)$/i,
    N =
      /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,
    O = { NaN: 1, Infinity: 1, "-Infinity": 1 },
    P = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
    Q = y.round,
    R = "setAttribute",
    S = parseFloat,
    T = parseInt,
    U = " progid:DXImageTransform.Microsoft",
    V = r[e].toUpperCase,
    W = {
      blur: 0,
      "clip-rect": "0 0 1e9 1e9",
      cursor: "default",
      cx: 0,
      cy: 0,
      fill: "#fff",
      "fill-opacity": 1,
      font: '10px "Arial"',
      "font-family": '"Arial"',
      "font-size": "10",
      "font-style": "normal",
      "font-weight": 400,
      gradient: 0,
      height: 0,
      href: "http://raphaeljs.com/",
      opacity: 1,
      path: "M0,0",
      r: 0,
      rotation: 0,
      rx: 0,
      ry: 0,
      scale: "1 1",
      src: "",
      stroke: "#000",
      "stroke-dasharray": "",
      "stroke-linecap": "butt",
      "stroke-linejoin": "butt",
      "stroke-miterlimit": 0,
      "stroke-opacity": 1,
      "stroke-width": 1,
      target: "_blank",
      "text-anchor": "middle",
      title: "Raphael",
      translation: "0 0",
      width: 0,
      x: 0,
      y: 0,
    },
    X = {
      along: "along",
      blur: E,
      "clip-rect": "csv",
      cx: E,
      cy: E,
      fill: "colour",
      "fill-opacity": E,
      "font-size": E,
      height: E,
      opacity: E,
      path: "path",
      r: E,
      rotation: "csv",
      rx: E,
      ry: E,
      scale: "csv",
      stroke: "colour",
      "stroke-opacity": E,
      "stroke-width": E,
      translation: "csv",
      width: E,
      x: E,
      y: E,
    },
    Y = "replace",
    Z = /^(from|to|\d+%?)$/,
    $ = /\s*,\s*/,
    _ = { hs: 1, rg: 1 },
    ba = /,?([achlmqrstvxz]),?/gi,
    bb = /([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/gi,
    bc = /(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/gi,
    bd = /^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/,
    be = function (a, b) {
      return a.key - b.key;
    };
  a.type =
    h.SVGAngle ||
    g.implementation.hasFeature(
      "http://www.w3.org/TR/SVG11/feature#BasicStructure",
      "1.1"
    )
      ? "SVG"
      : "VML";
  if (a.type == "VML") {
    var bf = g.createElement("div"),
      bg;
    bf.innerHTML = '<v:shape adj="1"/>';
    bg = bf.firstChild;
    bg.style.behavior = "url(#default#VML)";
    if (!(bg && typeof bg.adj == "object")) return (a.type = null);
    bf = null;
  }
  a.svg = !(a.vml = a.type == "VML");
  j[e] = a[e];
  k = j[e];
  a._id = 0;
  a._oid = 0;
  a.fn = {};
  a.is = function (a, b) {
    b = x.call(b);
    if (b == "finite") return !O[f](+a);
    return (
      (b == "null" && a === null) ||
      b == typeof a ||
      (b == "object" && a === Object(a)) ||
      (b == "array" && Array.isArray && Array.isArray(a)) ||
      J.call(a).slice(8, -1).toLowerCase() == b
    );
  };
  a.angle = function (b, c, d, e, f, g) {
    {
      if (f == null) {
        var h = b - d,
          i = c - e;
        if (!h && !i) return 0;
        return ((h < 0) * 180 + (y.atan(-i / -h) * 180) / D + 360) % 360;
      }
      return a.angle(b, c, f, g) - a.angle(d, e, f, g);
    }
  };
  a.rad = function (a) {
    return ((a % 360) * D) / 180;
  };
  a.deg = function (a) {
    return ((a * 180) / D) % 360;
  };
  a.snapTo = function (b, c, d) {
    d = a.is(d, "finite") ? d : 10;
    if (a.is(b, G)) {
      var e = b.length;
      while (e--) if (B(b[e] - c) <= d) return b[e];
    } else {
      b = +b;
      var f = c % b;
      if (f < d) return c - f;
      if (f > b - d) return c - f + b;
    }
    return c;
  };
  function bh() {
    var a = [],
      b = 0;
    for (; b < 32; b++) a[b] = (~~(y.random() * 16))[H](16);
    a[12] = 4;
    a[16] = ((a[16] & 3) | 8)[H](16);
    return "r-" + a[v]("");
  }
  a.setWindow = function (a) {
    h = a;
    g = h.document;
  };
  var bi = function (b) {
      if (a.vml) {
        var c = /^\s+|\s+$/g,
          d;
        try {
          var e = new ActiveXObject("htmlfile");
          e.write("<body>");
          e.close();
          d = e.body;
        } catch (a) {
          d = createPopup().document.body;
        }
        var f = d.createTextRange();
        bi = bm(function (a) {
          try {
            d.style.color = r(a)[Y](c, p);
            var b = f.queryCommandValue("ForeColor");
            b = ((b & 255) << 16) | (b & 65280) | ((b & 16711680) >>> 16);
            return "#" + ("000000" + b[H](16)).slice(-6);
          } catch (a) {
            return "none";
          }
        });
      } else {
        var h = g.createElement("i");
        h.title = "Raphaël Colour Picker";
        h.style.display = "none";
        g.body[l](h);
        bi = bm(function (a) {
          h.style.color = a;
          return g.defaultView.getComputedStyle(h, p).getPropertyValue("color");
        });
      }
      return bi(b);
    },
    bj = function () {
      return "hsb(" + [this.h, this.s, this.b] + ")";
    },
    bk = function () {
      return "hsl(" + [this.h, this.s, this.l] + ")";
    },
    bl = function () {
      return this.hex;
    };
  a.hsb2rgb = function (b, c, d, e) {
    if (a.is(b, "object") && "h" in b && "s" in b && "b" in b) {
      d = b.b;
      c = b.s;
      b = b.h;
      e = b.o;
    }
    return a.hsl2rgb(b, c, d / 2, e);
  };
  a.hsl2rgb = function (b, c, d, e) {
    if (a.is(b, "object") && "h" in b && "s" in b && "l" in b) {
      d = b.l;
      c = b.s;
      b = b.h;
    }
    if (b > 1 || c > 1 || d > 1) {
      b /= 360;
      c /= 100;
      d /= 100;
    }
    var f = {},
      g = ["r", "g", "b"],
      h,
      i,
      j,
      k,
      l,
      m;
    if (c) {
      d < 0.5 ? (h = d * (1 + c)) : (h = d + c - d * c);
      i = 2 * d - h;
      for (var n = 0; n < 3; n++) {
        j = b + (1 / 3) * -(n - 1);
        j < 0 && j++;
        j > 1 && j--;
        j * 6 < 1
          ? (f[g[n]] = i + (h - i) * 6 * j)
          : j * 2 < 1
          ? (f[g[n]] = h)
          : j * 3 < 2
          ? (f[g[n]] = i + (h - i) * (2 / 3 - j) * 6)
          : (f[g[n]] = i);
      }
    } else f = { r: d, g: d, b: d };
    f.r *= 255;
    f.g *= 255;
    f.b *= 255;
    f.hex =
      "#" + (16777216 | f.b | (f.g << 8) | (f.r << 16)).toString(16).slice(1);
    a.is(e, "finite") && (f.opacity = e);
    f.toString = bl;
    return f;
  };
  a.rgb2hsb = function (b, c, d) {
    if (c == null && a.is(b, "object") && "r" in b && "g" in b && "b" in b) {
      d = b.b;
      c = b.g;
      b = b.r;
    }
    if (c == null && a.is(b, F)) {
      var e = a.getRGB(b);
      b = e.r;
      c = e.g;
      d = e.b;
    }
    if (b > 1 || c > 1 || d > 1) {
      b /= 255;
      c /= 255;
      d /= 255;
    }
    var f = z(b, c, d),
      g = A(b, c, d),
      h,
      i,
      j = f;
    {
      if (g == f) return { h: 0, s: 0, b: f, toString: bj };
      var k = f - g;
      i = k / f;
      b == f
        ? (h = (c - d) / k)
        : c == f
        ? (h = 2 + (d - b) / k)
        : (h = 4 + (b - c) / k);
      h /= 6;
      h < 0 && h++;
      h > 1 && h--;
    }
    return { h: h, s: i, b: j, toString: bj };
  };
  a.rgb2hsl = function (b, c, d) {
    if (c == null && a.is(b, "object") && "r" in b && "g" in b && "b" in b) {
      d = b.b;
      c = b.g;
      b = b.r;
    }
    if (c == null && a.is(b, F)) {
      var e = a.getRGB(b);
      b = e.r;
      c = e.g;
      d = e.b;
    }
    if (b > 1 || c > 1 || d > 1) {
      b /= 255;
      c /= 255;
      d /= 255;
    }
    var f = z(b, c, d),
      g = A(b, c, d),
      h,
      i,
      j = (f + g) / 2,
      k;
    if (g == f) k = { h: 0, s: 0, l: j };
    else {
      var l = f - g;
      i = j < 0.5 ? l / (f + g) : l / (2 - f - g);
      b == f
        ? (h = (c - d) / l)
        : c == f
        ? (h = 2 + (d - b) / l)
        : (h = 4 + (b - c) / l);
      h /= 6;
      h < 0 && h++;
      h > 1 && h--;
      k = { h: h, s: i, l: j };
    }
    k.toString = bk;
    return k;
  };
  a._path2string = function () {
    return this.join(",")[Y](ba, "$1");
  };
  function bm(a, b, c) {
    function d() {
      var g = Array[e].slice.call(arguments, 0),
        h = g[v]("►"),
        i = (d.cache = d.cache || {}),
        j = (d.count = d.count || []);
      if (i[f](h)) return c ? c(i[h]) : i[h];
      j[w] >= 1000 && delete i[j.shift()];
      j[L](h);
      i[h] = a[m](b, g);
      return c ? c(i[h]) : i[h];
    }
    return d;
  }
  a.getRGB = bm(function (b) {
    if (!b || !!((b = r(b)).indexOf("-") + 1))
      return { r: -1, g: -1, b: -1, hex: "none", error: 1 };
    if (b == "none") return { r: -1, g: -1, b: -1, hex: "none" };
    !(_[f](b.toLowerCase().substring(0, 2)) || b.charAt() == "#") &&
      (b = bi(b));
    var c,
      d,
      e,
      g,
      h,
      i,
      j,
      k = b.match(N);
    if (k) {
      if (k[2]) {
        g = T(k[2].substring(5), 16);
        e = T(k[2].substring(3, 5), 16);
        d = T(k[2].substring(1, 3), 16);
      }
      if (k[3]) {
        g = T((i = k[3].charAt(3)) + i, 16);
        e = T((i = k[3].charAt(2)) + i, 16);
        d = T((i = k[3].charAt(1)) + i, 16);
      }
      if (k[4]) {
        j = k[4][s]($);
        d = S(j[0]);
        j[0].slice(-1) == "%" && (d *= 2.55);
        e = S(j[1]);
        j[1].slice(-1) == "%" && (e *= 2.55);
        g = S(j[2]);
        j[2].slice(-1) == "%" && (g *= 2.55);
        k[1].toLowerCase().slice(0, 4) == "rgba" && (h = S(j[3]));
        j[3] && j[3].slice(-1) == "%" && (h /= 100);
      }
      if (k[5]) {
        j = k[5][s]($);
        d = S(j[0]);
        j[0].slice(-1) == "%" && (d *= 2.55);
        e = S(j[1]);
        j[1].slice(-1) == "%" && (e *= 2.55);
        g = S(j[2]);
        j[2].slice(-1) == "%" && (g *= 2.55);
        (j[0].slice(-3) == "deg" || j[0].slice(-1) == "°") && (d /= 360);
        k[1].toLowerCase().slice(0, 4) == "hsba" && (h = S(j[3]));
        j[3] && j[3].slice(-1) == "%" && (h /= 100);
        return a.hsb2rgb(d, e, g, h);
      }
      if (k[6]) {
        j = k[6][s]($);
        d = S(j[0]);
        j[0].slice(-1) == "%" && (d *= 2.55);
        e = S(j[1]);
        j[1].slice(-1) == "%" && (e *= 2.55);
        g = S(j[2]);
        j[2].slice(-1) == "%" && (g *= 2.55);
        (j[0].slice(-3) == "deg" || j[0].slice(-1) == "°") && (d /= 360);
        k[1].toLowerCase().slice(0, 4) == "hsla" && (h = S(j[3]));
        j[3] && j[3].slice(-1) == "%" && (h /= 100);
        return a.hsl2rgb(d, e, g, h);
      }
      k = { r: d, g: e, b: g };
      k.hex = "#" + (16777216 | g | (e << 8) | (d << 16)).toString(16).slice(1);
      a.is(h, "finite") && (k.opacity = h);
      return k;
    }
    return { r: -1, g: -1, b: -1, hex: "none", error: 1 };
  }, a);
  a.getColor = function (a) {
    var b = (this.getColor.start = this.getColor.start || {
        h: 0,
        s: 1,
        b: a || 0.75,
      }),
      c = this.hsb2rgb(b.h, b.s, b.b);
    b.h += 0.075;
    if (b.h > 1) {
      b.h = 0;
      b.s -= 0.2;
      b.s <= 0 && (this.getColor.start = { h: 0, s: 1, b: b.b });
    }
    return c.hex;
  };
  a.getColor.reset = function () {
    delete this.start;
  };
  a.parsePathString = bm(function (b) {
    if (!b) return null;
    var c = { a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0 },
      d = [];
    a.is(b, G) && a.is(b[0], G) && (d = bo(b));
    d[w] ||
      r(b)[Y](bb, function (a, b, e) {
        var f = [],
          g = x.call(b);
        e[Y](bc, function (a, b) {
          b && f[L](+b);
        });
        if (g == "m" && f[w] > 2) {
          d[L]([b][n](f.splice(0, 2)));
          g = "l";
          b = b == "m" ? "l" : "L";
        }
        while (f[w] >= c[g]) {
          d[L]([b][n](f.splice(0, c[g])));
          if (!c[g]) break;
        }
      });
    d[H] = a._path2string;
    return d;
  });
  a.findDotsAtSegment = function (a, b, c, d, e, f, g, h, i) {
    var j = 1 - i,
      k = C(j, 3) * a + C(j, 2) * 3 * i * c + j * 3 * i * i * e + C(i, 3) * g,
      l = C(j, 3) * b + C(j, 2) * 3 * i * d + j * 3 * i * i * f + C(i, 3) * h,
      m = a + 2 * i * (c - a) + i * i * (e - 2 * c + a),
      n = b + 2 * i * (d - b) + i * i * (f - 2 * d + b),
      o = c + 2 * i * (e - c) + i * i * (g - 2 * e + c),
      p = d + 2 * i * (f - d) + i * i * (h - 2 * f + d),
      q = (1 - i) * a + i * c,
      r = (1 - i) * b + i * d,
      s = (1 - i) * e + i * g,
      t = (1 - i) * f + i * h,
      u = 90 - (y.atan((m - o) / (n - p)) * 180) / D;
    (m > o || n < p) && (u += 180);
    return {
      x: k,
      y: l,
      m: { x: m, y: n },
      n: { x: o, y: p },
      start: { x: q, y: r },
      end: { x: s, y: t },
      alpha: u,
    };
  };
  var bn = bm(function (a) {
      if (!a) return { x: 0, y: 0, width: 0, height: 0 };
      a = bw(a);
      var b = 0,
        c = 0,
        d = [],
        e = [],
        f;
      for (var g = 0, h = a[w]; g < h; g++) {
        f = a[g];
        if (f[0] == "M") {
          b = f[1];
          c = f[2];
          d[L](b);
          e[L](c);
        } else {
          var i = bv(b, c, f[1], f[2], f[3], f[4], f[5], f[6]);
          d = d[n](i.min.x, i.max.x);
          e = e[n](i.min.y, i.max.y);
          b = f[5];
          c = f[6];
        }
      }
      var j = A[m](0, d),
        k = A[m](0, e);
      return { x: j, y: k, width: z[m](0, d) - j, height: z[m](0, e) - k };
    }),
    bo = function (b) {
      var c = [];
      if (!a.is(b, G) || !a.is(b && b[0], G)) b = a.parsePathString(b);
      for (var d = 0, e = b[w]; d < e; d++) {
        c[d] = [];
        for (var f = 0, g = b[d][w]; f < g; f++) c[d][f] = b[d][f];
      }
      c[H] = a._path2string;
      return c;
    },
    bp = bm(
      function (b) {
        if (!a.is(b, G) || !a.is(b && b[0], G)) b = a.parsePathString(b);
        var c = [],
          d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;
        if (b[0][0] == "M") {
          d = b[0][1];
          e = b[0][2];
          f = d;
          g = e;
          h++;
          c[L](["M", d, e]);
        }
        for (var i = h, j = b[w]; i < j; i++) {
          var k = (c[i] = []),
            l = b[i];
          if (l[0] != x.call(l[0])) {
            k[0] = x.call(l[0]);
            switch (k[0]) {
              case "a":
                k[1] = l[1];
                k[2] = l[2];
                k[3] = l[3];
                k[4] = l[4];
                k[5] = l[5];
                k[6] = +(l[6] - d).toFixed(3);
                k[7] = +(l[7] - e).toFixed(3);
                break;
              case "v":
                k[1] = +(l[1] - e).toFixed(3);
                break;
              case "m":
                f = l[1];
                g = l[2];
              default:
                for (var m = 1, n = l[w]; m < n; m++)
                  k[m] = +(l[m] - (m % 2 ? d : e)).toFixed(3);
            }
          } else {
            k = c[i] = [];
            if (l[0] == "m") {
              f = l[1] + d;
              g = l[2] + e;
            }
            for (var o = 0, p = l[w]; o < p; o++) c[i][o] = l[o];
          }
          var q = c[i][w];
          switch (c[i][0]) {
            case "z":
              d = f;
              e = g;
              break;
            case "h":
              d += +c[i][q - 1];
              break;
            case "v":
              e += +c[i][q - 1];
              break;
            default:
              d += +c[i][q - 2];
              e += +c[i][q - 1];
          }
        }
        c[H] = a._path2string;
        return c;
      },
      0,
      bo
    ),
    bq = bm(
      function (b) {
        if (!a.is(b, G) || !a.is(b && b[0], G)) b = a.parsePathString(b);
        var c = [],
          d = 0,
          e = 0,
          f = 0,
          g = 0,
          h = 0;
        if (b[0][0] == "M") {
          d = +b[0][1];
          e = +b[0][2];
          f = d;
          g = e;
          h++;
          c[0] = ["M", d, e];
        }
        for (var i = h, j = b[w]; i < j; i++) {
          var k = (c[i] = []),
            l = b[i];
          if (l[0] != V.call(l[0])) {
            k[0] = V.call(l[0]);
            switch (k[0]) {
              case "A":
                k[1] = l[1];
                k[2] = l[2];
                k[3] = l[3];
                k[4] = l[4];
                k[5] = l[5];
                k[6] = +(l[6] + d);
                k[7] = +(l[7] + e);
                break;
              case "V":
                k[1] = +l[1] + e;
                break;
              case "H":
                k[1] = +l[1] + d;
                break;
              case "M":
                f = +l[1] + d;
                g = +l[2] + e;
              default:
                for (var m = 1, n = l[w]; m < n; m++)
                  k[m] = +l[m] + (m % 2 ? d : e);
            }
          } else for (var o = 0, p = l[w]; o < p; o++) c[i][o] = l[o];
          switch (k[0]) {
            case "Z":
              d = f;
              e = g;
              break;
            case "H":
              d = k[1];
              break;
            case "V":
              e = k[1];
              break;
            case "M":
              f = c[i][c[i][w] - 2];
              g = c[i][c[i][w] - 1];
            default:
              d = c[i][c[i][w] - 2];
              e = c[i][c[i][w] - 1];
          }
        }
        c[H] = a._path2string;
        return c;
      },
      null,
      bo
    ),
    br = function (a, b, c, d) {
      return [a, b, c, d, c, d];
    },
    bs = function (a, b, c, d, e, f) {
      var g = 1 / 3,
        h = 2 / 3;
      return [g * a + h * c, g * b + h * d, g * e + h * c, g * f + h * d, e, f];
    },
    bt = function (a, b, c, d, e, f, g, h, i, j) {
      var k = (D * 120) / 180,
        l = (D / 180) * (+e || 0),
        m = [],
        o,
        p = bm(function (a, b, c) {
          var d = a * y.cos(c) - b * y.sin(c),
            e = a * y.sin(c) + b * y.cos(c);
          return { x: d, y: e };
        });
      if (j) {
        G = j[0];
        H = j[1];
        E = j[2];
        F = j[3];
      } else {
        o = p(a, b, -l);
        a = o.x;
        b = o.y;
        o = p(h, i, -l);
        h = o.x;
        i = o.y;
        var q = y.cos((D / 180) * e),
          r = y.sin((D / 180) * e),
          t = (a - h) / 2,
          u = (b - i) / 2,
          x = (t * t) / (c * c) + (u * u) / (d * d);
        if (x > 1) {
          x = y.sqrt(x);
          c = x * c;
          d = x * d;
        }
        var z = c * c,
          A = d * d,
          C =
            (f == g ? -1 : 1) *
            y.sqrt(
              B((z * A - z * u * u - A * t * t) / (z * u * u + A * t * t))
            ),
          E = (C * c * u) / d + (a + h) / 2,
          F = (C * -d * t) / c + (b + i) / 2,
          G = y.asin(((b - F) / d).toFixed(9)),
          H = y.asin(((i - F) / d).toFixed(9));
        G = a < E ? D - G : G;
        H = h < E ? D - H : H;
        G < 0 && (G = D * 2 + G);
        H < 0 && (H = D * 2 + H);
        g && G > H && (G = G - D * 2);
        !g && H > G && (H = H - D * 2);
      }
      var I = H - G;
      if (B(I) > k) {
        var J = H,
          K = h,
          L = i;
        H = G + k * (g && H > G ? 1 : -1);
        h = E + c * y.cos(H);
        i = F + d * y.sin(H);
        m = bt(h, i, c, d, e, 0, g, K, L, [H, J, E, F]);
      }
      I = H - G;
      var M = y.cos(G),
        N = y.sin(G),
        O = y.cos(H),
        P = y.sin(H),
        Q = y.tan(I / 4),
        R = (4 / 3) * c * Q,
        S = (4 / 3) * d * Q,
        T = [a, b],
        U = [a + R * N, b - S * M],
        V = [h + R * P, i - S * O],
        W = [h, i];
      U[0] = 2 * T[0] - U[0];
      U[1] = 2 * T[1] - U[1];
      {
        if (j) return [U, V, W][n](m);
        m = [U, V, W][n](m)[v]()[s](",");
        var X = [];
        for (var Y = 0, Z = m[w]; Y < Z; Y++)
          X[Y] = Y % 2 ? p(m[Y - 1], m[Y], l).y : p(m[Y], m[Y + 1], l).x;
        return X;
      }
    },
    bu = function (a, b, c, d, e, f, g, h, i) {
      var j = 1 - i;
      return {
        x: C(j, 3) * a + C(j, 2) * 3 * i * c + j * 3 * i * i * e + C(i, 3) * g,
        y: C(j, 3) * b + C(j, 2) * 3 * i * d + j * 3 * i * i * f + C(i, 3) * h,
      };
    },
    bv = bm(function (a, b, c, d, e, f, g, h) {
      var i = e - 2 * c + a - (g - 2 * e + c),
        j = 2 * (c - a) - 2 * (e - c),
        k = a - c,
        l = (-j + y.sqrt(j * j - 4 * i * k)) / 2 / i,
        n = (-j - y.sqrt(j * j - 4 * i * k)) / 2 / i,
        o = [b, h],
        p = [a, g],
        q;
      B(l) > "1e12" && (l = 0.5);
      B(n) > "1e12" && (n = 0.5);
      if (l > 0 && l < 1) {
        q = bu(a, b, c, d, e, f, g, h, l);
        p[L](q.x);
        o[L](q.y);
      }
      if (n > 0 && n < 1) {
        q = bu(a, b, c, d, e, f, g, h, n);
        p[L](q.x);
        o[L](q.y);
      }
      i = f - 2 * d + b - (h - 2 * f + d);
      j = 2 * (d - b) - 2 * (f - d);
      k = b - d;
      l = (-j + y.sqrt(j * j - 4 * i * k)) / 2 / i;
      n = (-j - y.sqrt(j * j - 4 * i * k)) / 2 / i;
      B(l) > "1e12" && (l = 0.5);
      B(n) > "1e12" && (n = 0.5);
      if (l > 0 && l < 1) {
        q = bu(a, b, c, d, e, f, g, h, l);
        p[L](q.x);
        o[L](q.y);
      }
      if (n > 0 && n < 1) {
        q = bu(a, b, c, d, e, f, g, h, n);
        p[L](q.x);
        o[L](q.y);
      }
      return {
        min: { x: A[m](0, p), y: A[m](0, o) },
        max: { x: z[m](0, p), y: z[m](0, o) },
      };
    }),
    bw = bm(
      function (a, b) {
        var c = bq(a),
          d = b && bq(b),
          e = { x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null },
          f = { x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null },
          g = function (a, b) {
            var c, d;
            if (!a) return ["C", b.x, b.y, b.x, b.y, b.x, b.y];
            !(a[0] in { T: 1, Q: 1 }) && (b.qx = b.qy = null);
            switch (a[0]) {
              case "M":
                b.X = a[1];
                b.Y = a[2];
                break;
              case "A":
                a = ["C"][n](bt[m](0, [b.x, b.y][n](a.slice(1))));
                break;
              case "S":
                c = b.x + (b.x - (b.bx || b.x));
                d = b.y + (b.y - (b.by || b.y));
                a = ["C", c, d][n](a.slice(1));
                break;
              case "T":
                b.qx = b.x + (b.x - (b.qx || b.x));
                b.qy = b.y + (b.y - (b.qy || b.y));
                a = ["C"][n](bs(b.x, b.y, b.qx, b.qy, a[1], a[2]));
                break;
              case "Q":
                b.qx = a[1];
                b.qy = a[2];
                a = ["C"][n](bs(b.x, b.y, a[1], a[2], a[3], a[4]));
                break;
              case "L":
                a = ["C"][n](br(b.x, b.y, a[1], a[2]));
                break;
              case "H":
                a = ["C"][n](br(b.x, b.y, a[1], b.y));
                break;
              case "V":
                a = ["C"][n](br(b.x, b.y, b.x, a[1]));
                break;
              case "Z":
                a = ["C"][n](br(b.x, b.y, b.X, b.Y));
                break;
            }
            return a;
          },
          h = function (a, b) {
            if (a[b][w] > 7) {
              a[b].shift();
              var e = a[b];
              while (e[w]) a.splice(b++, 0, ["C"][n](e.splice(0, 6)));
              a.splice(b, 1);
              k = z(c[w], (d && d[w]) || 0);
            }
          },
          i = function (a, b, e, f, g) {
            if (a && b && a[g][0] == "M" && b[g][0] != "M") {
              b.splice(g, 0, ["M", f.x, f.y]);
              e.bx = 0;
              e.by = 0;
              e.x = a[g][1];
              e.y = a[g][2];
              k = z(c[w], (d && d[w]) || 0);
            }
          };
        for (var j = 0, k = z(c[w], (d && d[w]) || 0); j < k; j++) {
          c[j] = g(c[j], e);
          h(c, j);
          d && (d[j] = g(d[j], f));
          d && h(d, j);
          i(c, d, e, f, j);
          i(d, c, f, e, j);
          var l = c[j],
            o = d && d[j],
            p = l[w],
            q = d && o[w];
          e.x = l[p - 2];
          e.y = l[p - 1];
          e.bx = S(l[p - 4]) || e.x;
          e.by = S(l[p - 3]) || e.y;
          f.bx = d && (S(o[q - 4]) || f.x);
          f.by = d && (S(o[q - 3]) || f.y);
          f.x = d && o[q - 2];
          f.y = d && o[q - 1];
        }
        return d ? [c, d] : c;
      },
      null,
      bo
    ),
    bx = bm(function (b) {
      var c = [];
      for (var d = 0, e = b[w]; d < e; d++) {
        var f = {},
          g = b[d].match(/^([^:]*):?([\d\.]*)/);
        f.color = a.getRGB(g[1]);
        if (f.color.error) return null;
        f.color = f.color.hex;
        g[2] && (f.offset = g[2] + "%");
        c[L](f);
      }
      for (d = 1, e = c[w] - 1; d < e; d++) {
        if (!c[d].offset) {
          var h = S(c[d - 1].offset || 0),
            i = 0;
          for (var j = d + 1; j < e; j++) {
            if (c[j].offset) {
              i = c[j].offset;
              break;
            }
          }
          if (!i) {
            i = 100;
            j = e;
          }
          i = S(i);
          var k = (i - h) / (j - d + 1);
          for (; d < j; d++) {
            h += k;
            c[d].offset = h + "%";
          }
        }
      }
      return c;
    }),
    by = function (b, c, d, e) {
      var f;
      if (a.is(b, F) || a.is(b, "object")) {
        f = a.is(b, F) ? g.getElementById(b) : b;
        if (f.tagName)
          return c == null
            ? {
                container: f,
                width: f.style.pixelWidth || f.offsetWidth,
                height: f.style.pixelHeight || f.offsetHeight,
              }
            : { container: f, width: c, height: d };
      } else return { container: 1, x: b, y: c, width: d, height: e };
    },
    bz = function (a, b) {
      var c = this;
      for (var d in b) {
        if (b[f](d) && !(d in a))
          switch (typeof b[d]) {
            case "function":
              (function (b) {
                a[d] =
                  a === c
                    ? b
                    : function () {
                        return b[m](c, arguments);
                      };
              })(b[d]);
              break;
            case "object":
              a[d] = a[d] || {};
              bz.call(this, a[d], b[d]);
              break;
            default:
              a[d] = b[d];
              break;
          }
      }
    },
    bA = function (a, b) {
      a == b.top && (b.top = a.prev);
      a == b.bottom && (b.bottom = a.next);
      a.next && (a.next.prev = a.prev);
      a.prev && (a.prev.next = a.next);
    },
    bB = function (a, b) {
      if (b.top === a) return;
      bA(a, b);
      a.next = null;
      a.prev = b.top;
      b.top.next = a;
      b.top = a;
    },
    bC = function (a, b) {
      if (b.bottom === a) return;
      bA(a, b);
      a.next = b.bottom;
      a.prev = null;
      b.bottom.prev = a;
      b.bottom = a;
    },
    bD = function (a, b, c) {
      bA(a, c);
      b == c.top && (c.top = a);
      b.next && (b.next.prev = a);
      a.next = b.next;
      a.prev = b;
      b.next = a;
    },
    bE = function (a, b, c) {
      bA(a, c);
      b == c.bottom && (c.bottom = a);
      b.prev && (b.prev.next = a);
      a.prev = b.prev;
      b.prev = a;
      a.next = b;
    },
    bF = function (a) {
      return function () {
        throw new Error(
          "Raphaël: you are calling to method “" + a + "” of removed object"
        );
      };
    };
  a.pathToRelative = bp;
  if (a.svg) {
    k.svgns = "http://www.w3.org/2000/svg";
    k.xlink = "http://www.w3.org/1999/xlink";
    Q = function (a) {
      return +a + (~~a === a) * 0.5;
    };
    var bG = function (a, b) {
      if (b) for (var c in b) b[f](c) && a[R](c, r(b[c]));
      else {
        a = g.createElementNS(k.svgns, a);
        a.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
        return a;
      }
    };
    a[H] = function () {
      return (
        "Your browser supports SVG.\nYou are running Raphaël " + this.version
      );
    };
    var bH = function (a, b) {
        var c = bG("path");
        b.canvas && b.canvas[l](c);
        var d = new bN(c, b);
        d.type = "path";
        bK(d, { fill: "none", stroke: "#000", path: a });
        return d;
      },
      bI = function (a, b, c) {
        var d = "linear",
          e = 0.5,
          f = 0.5,
          h = a.style;
        b = r(b)[Y](bd, function (a, b, c) {
          d = "radial";
          if (b && c) {
            e = S(b);
            f = S(c);
            var g = (f > 0.5) * 2 - 1;
            C(e - 0.5, 2) + C(f - 0.5, 2) > 0.25 &&
              (f = y.sqrt(0.25 - C(e - 0.5, 2)) * g + 0.5) &&
              f != 0.5 &&
              (f = f.toFixed(5) - 0.00001 * g);
          }
          return p;
        });
        b = b[s](/\s*\-\s*/);
        if (d == "linear") {
          var i = b.shift();
          i = -S(i);
          if (isNaN(i)) return null;
          var j = [0, 0, y.cos((i * D) / 180), y.sin((i * D) / 180)],
            k = 1 / (z(B(j[2]), B(j[3])) || 1);
          j[2] *= k;
          j[3] *= k;
          if (j[2] < 0) {
            j[0] = -j[2];
            j[2] = 0;
          }
          if (j[3] < 0) {
            j[1] = -j[3];
            j[3] = 0;
          }
        }
        var m = bx(b);
        if (!m) return null;
        var n = a.getAttribute(I);
        n = n.match(/^url\(#(.*)\)$/);
        n && c.defs.removeChild(g.getElementById(n[1]));
        var o = bG(d + "Gradient");
        o.id = bh();
        bG(
          o,
          d == "radial"
            ? { fx: e, fy: f }
            : { x1: j[0], y1: j[1], x2: j[2], y2: j[3] }
        );
        c.defs[l](o);
        for (var q = 0, t = m[w]; q < t; q++) {
          var u = bG("stop");
          bG(u, {
            offset: m[q].offset ? m[q].offset : q ? "100%" : "0%",
            "stop-color": m[q].color || "#fff",
          });
          o[l](u);
        }
        bG(a, { fill: "url(#" + o.id + ")", opacity: 1, "fill-opacity": 1 });
        h.fill = p;
        h.opacity = 1;
        h.fillOpacity = 1;
        return 1;
      },
      bJ = function (b) {
        var c = b.getBBox();
        bG(b.pattern, {
          patternTransform: a.format("translate({0},{1})", c.x, c.y),
        });
      },
      bK = function (c, d) {
        var e = {
            "": [0],
            none: [0],
            "-": [3, 1],
            ".": [1, 1],
            "-.": [3, 1, 1, 1],
            "-..": [3, 1, 1, 1, 1, 1],
            ". ": [1, 3],
            "- ": [4, 3],
            "--": [8, 3],
            "- .": [4, 3, 1, 3],
            "--.": [8, 3, 1, 3],
            "--..": [8, 3, 1, 3, 1, 3],
          },
          h = c.node,
          i = c.attrs,
          j = c.rotate(),
          k = function (a, b) {
            b = e[x.call(b)];
            if (b) {
              var c = a.attrs["stroke-width"] || "1",
                f =
                  { round: c, square: c, butt: 0 }[
                    a.attrs["stroke-linecap"] || d["stroke-linecap"]
                  ] || 0,
                g = [],
                i = b[w];
              while (i--) g[i] = b[i] * c + (i % 2 ? 1 : -1) * f;
              bG(h, { "stroke-dasharray": g[v](",") });
            }
          };
        d[f]("rotation") && (j = d.rotation);
        var m = r(j)[s](b);
        if (m.length - 1) {
          m[1] = +m[1];
          m[2] = +m[2];
        } else m = null;
        S(j) && c.rotate(0, true);
        for (var n in d) {
          if (d[f](n)) {
            if (!W[f](n)) continue;
            var o = d[n];
            i[n] = o;
            switch (n) {
              case "blur":
                c.blur(o);
                break;
              case "rotation":
                c.rotate(o, true);
                break;
              case "href":
              case "title":
              case "target":
                var t = h.parentNode;
                if (x.call(t.tagName) != "a") {
                  var u = bG("a");
                  t.insertBefore(u, h);
                  u[l](h);
                  t = u;
                }
                n == "target" && o == "blank"
                  ? t.setAttributeNS(c.paper.xlink, "show", "new")
                  : t.setAttributeNS(c.paper.xlink, n, o);
                break;
              case "cursor":
                h.style.cursor = o;
                break;
              case "clip-rect":
                var y = r(o)[s](b);
                if (y[w] == 4) {
                  c.clip &&
                    c.clip.parentNode.parentNode.removeChild(c.clip.parentNode);
                  var z = bG("clipPath"),
                    A = bG("rect");
                  z.id = bh();
                  bG(A, { x: y[0], y: y[1], width: y[2], height: y[3] });
                  z[l](A);
                  c.paper.defs[l](z);
                  bG(h, { "clip-path": "url(#" + z.id + ")" });
                  c.clip = A;
                }
                if (!o) {
                  var B = g.getElementById(
                    h.getAttribute("clip-path")[Y](/(^url\(#|\)$)/g, p)
                  );
                  B && B.parentNode.removeChild(B);
                  bG(h, { "clip-path": p });
                  delete c.clip;
                }
                break;
              case "path":
                c.type == "path" && bG(h, { d: o ? (i.path = bq(o)) : "M0,0" });
                break;
              case "width":
                h[R](n, o);
                if (i.fx) {
                  n = "x";
                  o = i.x;
                } else break;
              case "x":
                i.fx && (o = -i.x - (i.width || 0));
              case "rx":
                if (n == "rx" && c.type == "rect") break;
              case "cx":
                m && (n == "x" || n == "cx") && (m[1] += o - i[n]);
                h[R](n, o);
                c.pattern && bJ(c);
                break;
              case "height":
                h[R](n, o);
                if (i.fy) {
                  n = "y";
                  o = i.y;
                } else break;
              case "y":
                i.fy && (o = -i.y - (i.height || 0));
              case "ry":
                if (n == "ry" && c.type == "rect") break;
              case "cy":
                m && (n == "y" || n == "cy") && (m[2] += o - i[n]);
                h[R](n, o);
                c.pattern && bJ(c);
                break;
              case "r":
                c.type == "rect" ? bG(h, { rx: o, ry: o }) : h[R](n, o);
                break;
              case "src":
                c.type == "image" && h.setAttributeNS(c.paper.xlink, "href", o);
                break;
              case "stroke-width":
                h.style.strokeWidth = o;
                h[R](n, o);
                i["stroke-dasharray"] && k(c, i["stroke-dasharray"]);
                break;
              case "stroke-dasharray":
                k(c, o);
                break;
              case "translation":
                var C = r(o)[s](b);
                C[0] = +C[0] || 0;
                C[1] = +C[1] || 0;
                if (m) {
                  m[1] += C[0];
                  m[2] += C[1];
                }
                cz.call(c, C[0], C[1]);
                break;
              case "scale":
                C = r(o)[s](b);
                c.scale(
                  +C[0] || 1,
                  +C[1] || +C[0] || 1,
                  isNaN(S(C[2])) ? null : +C[2],
                  isNaN(S(C[3])) ? null : +C[3]
                );
                break;
              case I:
                var D = r(o).match(M);
                if (D) {
                  z = bG("pattern");
                  var E = bG("image");
                  z.id = bh();
                  bG(z, {
                    x: 0,
                    y: 0,
                    patternUnits: "userSpaceOnUse",
                    height: 1,
                    width: 1,
                  });
                  bG(E, { x: 0, y: 0 });
                  E.setAttributeNS(c.paper.xlink, "href", D[1]);
                  z[l](E);
                  var F = g.createElement("img");
                  F.style.cssText = "position:absolute;left:-9999em;top-9999em";
                  F.onload = function () {
                    bG(z, {
                      width: this.offsetWidth,
                      height: this.offsetHeight,
                    });
                    bG(E, {
                      width: this.offsetWidth,
                      height: this.offsetHeight,
                    });
                    g.body.removeChild(this);
                    c.paper.safari();
                  };
                  g.body[l](F);
                  F.src = D[1];
                  c.paper.defs[l](z);
                  h.style.fill = "url(#" + z.id + ")";
                  bG(h, { fill: "url(#" + z.id + ")" });
                  c.pattern = z;
                  c.pattern && bJ(c);
                  break;
                }
                var G = a.getRGB(o);
                if (G.error)
                  if (
                    ({ circle: 1, ellipse: 1 }[f](c.type) ||
                      r(o).charAt() != "r") &&
                    bI(h, o, c.paper)
                  ) {
                    i.gradient = o;
                    i.fill = "none";
                    break;
                  } else {
                    delete d.gradient;
                    delete i.gradient;
                    !a.is(i.opacity, "undefined") &&
                      a.is(d.opacity, "undefined") &&
                      bG(h, { opacity: i.opacity });
                    !a.is(i["fill-opacity"], "undefined") &&
                      a.is(d["fill-opacity"], "undefined") &&
                      bG(h, { "fill-opacity": i["fill-opacity"] });
                  }
                G[f]("opacity") &&
                  bG(h, {
                    "fill-opacity": G.opacity > 1 ? G.opacity / 100 : G.opacity,
                  });
              case "stroke":
                G = a.getRGB(o);
                h[R](n, G.hex);
                n == "stroke" &&
                  G[f]("opacity") &&
                  bG(h, {
                    "stroke-opacity":
                      G.opacity > 1 ? G.opacity / 100 : G.opacity,
                  });
                break;
              case "gradient":
                (({ circle: 1, ellipse: 1 })[f](c.type) ||
                  r(o).charAt() != "r") &&
                  bI(h, o, c.paper);
                break;
              case "opacity":
                i.gradient &&
                  !i[f]("stroke-opacity") &&
                  bG(h, { "stroke-opacity": o > 1 ? o / 100 : o });
              case "fill-opacity":
                if (i.gradient) {
                  var H = g.getElementById(
                    h.getAttribute(I)[Y](/^url\(#|\)$/g, p)
                  );
                  if (H) {
                    var J = H.getElementsByTagName("stop");
                    J[J[w] - 1][R]("stop-opacity", o);
                  }
                  break;
                }
              default:
                n == "font-size" && (o = T(o, 10) + "px");
                var K = n[Y](/(\-.)/g, function (a) {
                  return V.call(a.substring(1));
                });
                h.style[K] = o;
                h[R](n, o);
                break;
            }
          }
        }
        bM(c, d);
        m ? c.rotate(m.join(q)) : S(j) && c.rotate(j, true);
      },
      bL = 1.2,
      bM = function (b, c) {
        if (
          b.type != "text" ||
          !(
            c[f]("text") ||
            c[f]("font") ||
            c[f]("font-size") ||
            c[f]("x") ||
            c[f]("y")
          )
        )
          return;
        var d = b.attrs,
          e = b.node,
          h = e.firstChild
            ? T(
                g.defaultView
                  .getComputedStyle(e.firstChild, p)
                  .getPropertyValue("font-size"),
                10
              )
            : 10;
        if (c[f]("text")) {
          d.text = c.text;
          while (e.firstChild) e.removeChild(e.firstChild);
          var i = r(c.text)[s]("\n");
          for (var j = 0, k = i[w]; j < k; j++)
            if (i[j]) {
              var m = bG("tspan");
              j && bG(m, { dy: h * bL, x: d.x });
              m[l](g.createTextNode(i[j]));
              e[l](m);
            }
        } else {
          i = e.getElementsByTagName("tspan");
          for (j = 0, k = i[w]; j < k; j++)
            j && bG(i[j], { dy: h * bL, x: d.x });
        }
        bG(e, { y: d.y });
        var n = b.getBBox(),
          o = d.y - (n.y + n.height / 2);
        o && a.is(o, "finite") && bG(e, { y: d.y + o });
      },
      bN = function (b, c) {
        var d = 0,
          e = 0;
        this[0] = b;
        this.id = a._oid++;
        this.node = b;
        b.raphael = this;
        this.paper = c;
        this.attrs = this.attrs || {};
        this.transformations = [];
        this._ = { tx: 0, ty: 0, rt: { deg: 0, cx: 0, cy: 0 }, sx: 1, sy: 1 };
        !c.bottom && (c.bottom = this);
        this.prev = c.top;
        c.top && (c.top.next = this);
        c.top = this;
        this.next = null;
      },
      bO = bN[e];
    bN[e].rotate = function (c, d, e) {
      if (this.removed) return this;
      if (c == null) {
        if (this._.rt.cx)
          return [this._.rt.deg, this._.rt.cx, this._.rt.cy][v](q);
        return this._.rt.deg;
      }
      var f = this.getBBox();
      c = r(c)[s](b);
      if (c[w] - 1) {
        d = S(c[1]);
        e = S(c[2]);
      }
      c = S(c[0]);
      d != null && d !== false ? (this._.rt.deg = c) : (this._.rt.deg += c);
      e == null && (d = null);
      this._.rt.cx = d;
      this._.rt.cy = e;
      d = d == null ? f.x + f.width / 2 : d;
      e = e == null ? f.y + f.height / 2 : e;
      if (this._.rt.deg) {
        this.transformations[0] = a.format(
          "rotate({0} {1} {2})",
          this._.rt.deg,
          d,
          e
        );
        this.clip &&
          bG(this.clip, {
            transform: a.format("rotate({0} {1} {2})", -this._.rt.deg, d, e),
          });
      } else {
        this.transformations[0] = p;
        this.clip && bG(this.clip, { transform: p });
      }
      bG(this.node, { transform: this.transformations[v](q) });
      return this;
    };
    bN[e].hide = function () {
      !this.removed && (this.node.style.display = "none");
      return this;
    };
    bN[e].show = function () {
      !this.removed && (this.node.style.display = "");
      return this;
    };
    bN[e].remove = function () {
      if (this.removed) return;
      bA(this, this.paper);
      this.node.parentNode.removeChild(this.node);
      for (var a in this) delete this[a];
      this.removed = true;
    };
    bN[e].getBBox = function () {
      if (this.removed) return this;
      if (this.type == "path") return bn(this.attrs.path);
      if (this.node.style.display == "none") {
        this.show();
        var a = true;
      }
      var b = {};
      try {
        b = this.node.getBBox();
      } catch (a) {
      } finally {
        b = b || {};
      }
      if (this.type == "text") {
        b = { x: b.x, y: Infinity, width: 0, height: 0 };
        for (var c = 0, d = this.node.getNumberOfChars(); c < d; c++) {
          var e = this.node.getExtentOfChar(c);
          e.y < b.y && (b.y = e.y);
          e.y + e.height - b.y > b.height && (b.height = e.y + e.height - b.y);
          e.x + e.width - b.x > b.width && (b.width = e.x + e.width - b.x);
        }
      }
      a && this.hide();
      return b;
    };
    bN[e].attr = function (b, c) {
      if (this.removed) return this;
      if (b == null) {
        var d = {};
        for (var e in this.attrs) this.attrs[f](e) && (d[e] = this.attrs[e]);
        this._.rt.deg && (d.rotation = this.rotate());
        (this._.sx != 1 || this._.sy != 1) && (d.scale = this.scale());
        d.gradient &&
          d.fill == "none" &&
          (d.fill = d.gradient) &&
          delete d.gradient;
        return d;
      }
      if (c == null && a.is(b, F)) {
        if (b == "translation") return cz.call(this);
        if (b == "rotation") return this.rotate();
        if (b == "scale") return this.scale();
        if (b == I && this.attrs.fill == "none" && this.attrs.gradient)
          return this.attrs.gradient;
        return this.attrs[b];
      }
      if (c == null && a.is(b, G)) {
        var g = {};
        for (var h = 0, i = b.length; h < i; h++) g[b[h]] = this.attr(b[h]);
        return g;
      }
      if (c != null) {
        var j = {};
        j[b] = c;
      } else b != null && a.is(b, "object") && (j = b);
      for (var k in this.paper.customAttributes)
        if (
          this.paper.customAttributes[f](k) &&
          j[f](k) &&
          a.is(this.paper.customAttributes[k], "function")
        ) {
          var l = this.paper.customAttributes[k].apply(this, [][n](j[k]));
          this.attrs[k] = j[k];
          for (var m in l) l[f](m) && (j[m] = l[m]);
        }
      bK(this, j);
      return this;
    };
    bN[e].toFront = function () {
      if (this.removed) return this;
      this.node.parentNode[l](this.node);
      var a = this.paper;
      a.top != this && bB(this, a);
      return this;
    };
    bN[e].toBack = function () {
      if (this.removed) return this;
      if (this.node.parentNode.firstChild != this.node) {
        this.node.parentNode.insertBefore(
          this.node,
          this.node.parentNode.firstChild
        );
        bC(this, this.paper);
        var a = this.paper;
      }
      return this;
    };
    bN[e].insertAfter = function (a) {
      if (this.removed) return this;
      var b = a.node || a[a.length - 1].node;
      b.nextSibling
        ? b.parentNode.insertBefore(this.node, b.nextSibling)
        : b.parentNode[l](this.node);
      bD(this, a, this.paper);
      return this;
    };
    bN[e].insertBefore = function (a) {
      if (this.removed) return this;
      var b = a.node || a[0].node;
      b.parentNode.insertBefore(this.node, b);
      bE(this, a, this.paper);
      return this;
    };
    bN[e].blur = function (a) {
      var b = this;
      if (+a !== 0) {
        var c = bG("filter"),
          d = bG("feGaussianBlur");
        b.attrs.blur = a;
        c.id = bh();
        bG(d, { stdDeviation: +a || 1.5 });
        c.appendChild(d);
        b.paper.defs.appendChild(c);
        b._blur = c;
        bG(b.node, { filter: "url(#" + c.id + ")" });
      } else {
        if (b._blur) {
          b._blur.parentNode.removeChild(b._blur);
          delete b._blur;
          delete b.attrs.blur;
        }
        b.node.removeAttribute("filter");
      }
    };
    var bP = function (a, b, c, d) {
        var e = bG("circle");
        a.canvas && a.canvas[l](e);
        var f = new bN(e, a);
        f.attrs = { cx: b, cy: c, r: d, fill: "none", stroke: "#000" };
        f.type = "circle";
        bG(e, f.attrs);
        return f;
      },
      bQ = function (a, b, c, d, e, f) {
        var g = bG("rect");
        a.canvas && a.canvas[l](g);
        var h = new bN(g, a);
        h.attrs = {
          x: b,
          y: c,
          width: d,
          height: e,
          r: f || 0,
          rx: f || 0,
          ry: f || 0,
          fill: "none",
          stroke: "#000",
        };
        h.type = "rect";
        bG(g, h.attrs);
        return h;
      },
      bR = function (a, b, c, d, e) {
        var f = bG("ellipse");
        a.canvas && a.canvas[l](f);
        var g = new bN(f, a);
        g.attrs = { cx: b, cy: c, rx: d, ry: e, fill: "none", stroke: "#000" };
        g.type = "ellipse";
        bG(f, g.attrs);
        return g;
      },
      bS = function (a, b, c, d, e, f) {
        var g = bG("image");
        bG(g, { x: c, y: d, width: e, height: f, preserveAspectRatio: "none" });
        g.setAttributeNS(a.xlink, "href", b);
        a.canvas && a.canvas[l](g);
        var h = new bN(g, a);
        h.attrs = { x: c, y: d, width: e, height: f, src: b };
        h.type = "image";
        return h;
      },
      bT = function (a, b, c, d) {
        var e = bG("text");
        bG(e, { x: b, y: c, "text-anchor": "middle" });
        a.canvas && a.canvas[l](e);
        var f = new bN(e, a);
        f.attrs = {
          x: b,
          y: c,
          "text-anchor": "middle",
          text: d,
          font: W.font,
          stroke: "none",
          fill: "#000",
        };
        f.type = "text";
        bK(f, f.attrs);
        return f;
      },
      bU = function (a, b) {
        this.width = a || this.width;
        this.height = b || this.height;
        this.canvas[R]("width", this.width);
        this.canvas[R]("height", this.height);
        return this;
      },
      bV = function () {
        var b = by[m](0, arguments),
          c = b && b.container,
          d = b.x,
          e = b.y,
          f = b.width,
          h = b.height;
        if (!c) throw new Error("SVG container not found.");
        var i = bG("svg");
        d = d || 0;
        e = e || 0;
        f = f || 512;
        h = h || 342;
        bG(i, {
          xmlns: "http://www.w3.org/2000/svg",
          version: 1.1,
          width: f,
          height: h,
        });
        if (c == 1) {
          i.style.cssText =
            "position:absolute;left:" + d + "px;top:" + e + "px";
          g.body[l](i);
        } else c.firstChild ? c.insertBefore(i, c.firstChild) : c[l](i);
        c = new j();
        c.width = f;
        c.height = h;
        c.canvas = i;
        bz.call(c, c, a.fn);
        c.clear();
        return c;
      };
    k.clear = function () {
      var a = this.canvas;
      while (a.firstChild) a.removeChild(a.firstChild);
      this.bottom = this.top = null;
      (this.desc = bG("desc"))[l](g.createTextNode("Created with Raphaël"));
      a[l](this.desc);
      a[l]((this.defs = bG("defs")));
    };
    k.remove = function () {
      this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
      for (var a in this) this[a] = bF(a);
    };
  }
  if (a.vml) {
    var bW = { M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x" },
      bX = /([clmz]),?([^clmz]*)/gi,
      bY = / progid:\S+Blur\([^\)]+\)/g,
      bZ = /-?[^,\s-]+/g,
      b$ = 1000 + q + 1000,
      b_ = 10,
      ca = { path: 1, rect: 1 },
      cb = function (a) {
        var b = /[ahqstv]/gi,
          c = bq;
        r(a).match(b) && (c = bw);
        b = /[clmz]/g;
        if (c == bq && !r(a).match(b)) {
          var d = r(a)[Y](bX, function (a, b, c) {
            var d = [],
              e = x.call(b) == "m",
              f = bW[b];
            c[Y](bZ, function (a) {
              if (e && d[w] == 2) {
                f += d + bW[b == "m" ? "l" : "L"];
                d = [];
              }
              d[L](Q(a * b_));
            });
            return f + d;
          });
          return d;
        }
        var e = c(a),
          f,
          g;
        d = [];
        for (var h = 0, i = e[w]; h < i; h++) {
          f = e[h];
          g = x.call(e[h][0]);
          g == "z" && (g = "x");
          for (var j = 1, k = f[w]; j < k; j++)
            g += Q(f[j] * b_) + (j != k - 1 ? "," : p);
          d[L](g);
        }
        return d[v](q);
      };
    a[H] = function () {
      return (
        "Your browser doesn’t support SVG. Falling down to VML.\nYou are running Raphaël " +
        this.version
      );
    };
    bH = function (a, b) {
      var c = cd("group");
      c.style.cssText =
        "position:absolute;left:0;top:0;width:" +
        b.width +
        "px;height:" +
        b.height +
        "px";
      c.coordsize = b.coordsize;
      c.coordorigin = b.coordorigin;
      var d = cd("shape"),
        e = d.style;
      e.width = b.width + "px";
      e.height = b.height + "px";
      d.coordsize = b$;
      d.coordorigin = b.coordorigin;
      c[l](d);
      var f = new bN(d, c, b),
        g = { fill: "none", stroke: "#000" };
      a && (g.path = a);
      f.type = "path";
      f.path = [];
      f.Path = p;
      bK(f, g);
      b.canvas[l](c);
      return f;
    };
    bK = function (c, d) {
      c.attrs = c.attrs || {};
      var e = c.node,
        h = c.attrs,
        i = e.style,
        j,
        k =
          (d.x != h.x ||
            d.y != h.y ||
            d.width != h.width ||
            d.height != h.height ||
            d.r != h.r) &&
          c.type == "rect",
        m = c;
      for (var n in d) d[f](n) && (h[n] = d[n]);
      if (k) {
        h.path = cc(h.x, h.y, h.width, h.height, h.r);
        c.X = h.x;
        c.Y = h.y;
        c.W = h.width;
        c.H = h.height;
      }
      d.href && (e.href = d.href);
      d.title && (e.title = d.title);
      d.target && (e.target = d.target);
      d.cursor && (i.cursor = d.cursor);
      "blur" in d && c.blur(d.blur);
      if ((d.path && c.type == "path") || k) e.path = cb(h.path);
      d.rotation != null && c.rotate(d.rotation, true);
      if (d.translation) {
        j = r(d.translation)[s](b);
        cz.call(c, j[0], j[1]);
        if (c._.rt.cx != null) {
          c._.rt.cx += +j[0];
          c._.rt.cy += +j[1];
          c.setBox(c.attrs, j[0], j[1]);
        }
      }
      if (d.scale) {
        j = r(d.scale)[s](b);
        c.scale(+j[0] || 1, +j[1] || +j[0] || 1, +j[2] || null, +j[3] || null);
      }
      if ("clip-rect" in d) {
        var o = r(d["clip-rect"])[s](b);
        if (o[w] == 4) {
          o[2] = +o[2] + +o[0];
          o[3] = +o[3] + +o[1];
          var q = e.clipRect || g.createElement("div"),
            t = q.style,
            u = e.parentNode;
          t.clip = a.format("rect({1}px {2}px {3}px {0}px)", o);
          if (!e.clipRect) {
            t.position = "absolute";
            t.top = 0;
            t.left = 0;
            t.width = c.paper.width + "px";
            t.height = c.paper.height + "px";
            u.parentNode.insertBefore(q, u);
            q[l](u);
            e.clipRect = q;
          }
        }
        d["clip-rect"] || (e.clipRect && (e.clipRect.style.clip = p));
      }
      c.type == "image" && d.src && (e.src = d.src);
      if (c.type == "image" && d.opacity) {
        e.filterOpacity = U + ".Alpha(opacity=" + d.opacity * 100 + ")";
        i.filter = (e.filterMatrix || p) + (e.filterOpacity || p);
      }
      d.font && (i.font = d.font);
      d["font-family"] &&
        (i.fontFamily =
          '"' + d["font-family"][s](",")[0][Y](/^['"]+|['"]+$/g, p) + '"');
      d["font-size"] && (i.fontSize = d["font-size"]);
      d["font-weight"] && (i.fontWeight = d["font-weight"]);
      d["font-style"] && (i.fontStyle = d["font-style"]);
      if (
        d.opacity != null ||
        d["stroke-width"] != null ||
        d.fill != null ||
        d.stroke != null ||
        d["stroke-width"] != null ||
        d["stroke-opacity"] != null ||
        d["fill-opacity"] != null ||
        d["stroke-dasharray"] != null ||
        d["stroke-miterlimit"] != null ||
        d["stroke-linejoin"] != null ||
        d["stroke-linecap"] != null
      ) {
        e = c.shape || e;
        var v = e.getElementsByTagName(I) && e.getElementsByTagName(I)[0],
          x = false;
        !v && (x = v = cd(I));
        if ("fill-opacity" in d || "opacity" in d) {
          var y =
            ((+h["fill-opacity"] + 1 || 2) - 1) *
            ((+h.opacity + 1 || 2) - 1) *
            ((+a.getRGB(d.fill).o + 1 || 2) - 1);
          y = A(z(y, 0), 1);
          v.opacity = y;
        }
        d.fill && (v.on = true);
        if (v.on == null || d.fill == "none") v.on = false;
        if (v.on && d.fill) {
          var B = d.fill.match(M);
          if (B) {
            v.src = B[1];
            v.type = "tile";
          } else {
            v.color = a.getRGB(d.fill).hex;
            v.src = p;
            v.type = "solid";
            if (
              a.getRGB(d.fill).error &&
              (m.type in { circle: 1, ellipse: 1 } ||
                r(d.fill).charAt() != "r") &&
              bI(m, d.fill)
            ) {
              h.fill = "none";
              h.gradient = d.fill;
            }
          }
        }
        x && e[l](v);
        var C =
            e.getElementsByTagName("stroke") &&
            e.getElementsByTagName("stroke")[0],
          D = false;
        !C && (D = C = cd("stroke"));
        if (
          (d.stroke && d.stroke != "none") ||
          d["stroke-width"] ||
          d["stroke-opacity"] != null ||
          d["stroke-dasharray"] ||
          d["stroke-miterlimit"] ||
          d["stroke-linejoin"] ||
          d["stroke-linecap"]
        )
          C.on = true;
        (d.stroke == "none" ||
          C.on == null ||
          d.stroke == 0 ||
          d["stroke-width"] == 0) &&
          (C.on = false);
        var E = a.getRGB(d.stroke);
        C.on && d.stroke && (C.color = E.hex);
        y =
          ((+h["stroke-opacity"] + 1 || 2) - 1) *
          ((+h.opacity + 1 || 2) - 1) *
          ((+E.o + 1 || 2) - 1);
        var F = (S(d["stroke-width"]) || 1) * 0.75;
        y = A(z(y, 0), 1);
        d["stroke-width"] == null && (F = h["stroke-width"]);
        d["stroke-width"] && (C.weight = F);
        F && F < 1 && (y *= F) && (C.weight = 1);
        C.opacity = y;
        d["stroke-linejoin"] && (C.joinstyle = d["stroke-linejoin"] || "miter");
        C.miterlimit = d["stroke-miterlimit"] || 8;
        d["stroke-linecap"] &&
          (C.endcap =
            d["stroke-linecap"] == "butt"
              ? "flat"
              : d["stroke-linecap"] == "square"
              ? "square"
              : "round");
        if (d["stroke-dasharray"]) {
          var G = {
            "-": "shortdash",
            ".": "shortdot",
            "-.": "shortdashdot",
            "-..": "shortdashdotdot",
            ". ": "dot",
            "- ": "dash",
            "--": "longdash",
            "- .": "dashdot",
            "--.": "longdashdot",
            "--..": "longdashdotdot",
          };
          C.dashstyle = G[f](d["stroke-dasharray"])
            ? G[d["stroke-dasharray"]]
            : p;
        }
        D && e[l](C);
      }
      if (m.type == "text") {
        i = m.paper.span.style;
        h.font && (i.font = h.font);
        h["font-family"] && (i.fontFamily = h["font-family"]);
        h["font-size"] && (i.fontSize = h["font-size"]);
        h["font-weight"] && (i.fontWeight = h["font-weight"]);
        h["font-style"] && (i.fontStyle = h["font-style"]);
        m.node.string &&
          (m.paper.span.innerHTML = r(m.node.string)
            [Y](/</g, "&#60;")
            [Y](/&/g, "&#38;")
            [Y](/\n/g, "<br>"));
        m.W = h.w = m.paper.span.offsetWidth;
        m.H = h.h = m.paper.span.offsetHeight;
        m.X = h.x;
        m.Y = h.y + Q(m.H / 2);
        switch (h["text-anchor"]) {
          case "start":
            m.node.style["v-text-align"] = "left";
            m.bbx = Q(m.W / 2);
            break;
          case "end":
            m.node.style["v-text-align"] = "right";
            m.bbx = -Q(m.W / 2);
            break;
          default:
            m.node.style["v-text-align"] = "center";
            break;
        }
      }
    };
    bI = function (a, b) {
      a.attrs = a.attrs || {};
      var c = a.attrs,
        d,
        e = "linear",
        f = ".5 .5";
      a.attrs.gradient = b;
      b = r(b)[Y](bd, function (a, b, c) {
        e = "radial";
        if (b && c) {
          b = S(b);
          c = S(c);
          C(b - 0.5, 2) + C(c - 0.5, 2) > 0.25 &&
            (c = y.sqrt(0.25 - C(b - 0.5, 2)) * ((c > 0.5) * 2 - 1) + 0.5);
          f = b + q + c;
        }
        return p;
      });
      b = b[s](/\s*\-\s*/);
      if (e == "linear") {
        var g = b.shift();
        g = -S(g);
        if (isNaN(g)) return null;
      }
      var h = bx(b);
      if (!h) return null;
      a = a.shape || a.node;
      d = a.getElementsByTagName(I)[0] || cd(I);
      !d.parentNode && a.appendChild(d);
      if (h[w]) {
        d.on = true;
        d.method = "none";
        d.color = h[0].color;
        d.color2 = h[h[w] - 1].color;
        var i = [];
        for (var j = 0, k = h[w]; j < k; j++)
          h[j].offset && i[L](h[j].offset + q + h[j].color);
        d.colors && (d.colors.value = i[w] ? i[v]() : "0% " + d.color);
        if (e == "radial") {
          d.type = "gradientradial";
          d.focus = "100%";
          d.focussize = f;
          d.focusposition = f;
        } else {
          d.type = "gradient";
          d.angle = (270 - g) % 360;
        }
      }
      return 1;
    };
    bN = function (b, c, d) {
      var e = 0,
        f = 0,
        g = 0,
        h = 1;
      this[0] = b;
      this.id = a._oid++;
      this.node = b;
      b.raphael = this;
      this.X = 0;
      this.Y = 0;
      this.attrs = {};
      this.Group = c;
      this.paper = d;
      this._ = { tx: 0, ty: 0, rt: { deg: 0 }, sx: 1, sy: 1 };
      !d.bottom && (d.bottom = this);
      this.prev = d.top;
      d.top && (d.top.next = this);
      d.top = this;
      this.next = null;
    };
    bO = bN[e];
    bO.rotate = function (a, c, d) {
      if (this.removed) return this;
      if (a == null) {
        if (this._.rt.cx)
          return [this._.rt.deg, this._.rt.cx, this._.rt.cy][v](q);
        return this._.rt.deg;
      }
      a = r(a)[s](b);
      if (a[w] - 1) {
        c = S(a[1]);
        d = S(a[2]);
      }
      a = S(a[0]);
      c != null ? (this._.rt.deg = a) : (this._.rt.deg += a);
      d == null && (c = null);
      this._.rt.cx = c;
      this._.rt.cy = d;
      this.setBox(this.attrs, c, d);
      this.Group.style.rotation = this._.rt.deg;
      return this;
    };
    bO.setBox = function (a, b, c) {
      if (this.removed) return this;
      var d = this.Group.style,
        e = (this.shape && this.shape.style) || this.node.style;
      a = a || {};
      for (var g in a) a[f](g) && (this.attrs[g] = a[g]);
      b = b || this._.rt.cx;
      c = c || this._.rt.cy;
      var h = this.attrs,
        i,
        j,
        k,
        l;
      switch (this.type) {
        case "circle":
          i = h.cx - h.r;
          j = h.cy - h.r;
          k = l = h.r * 2;
          break;
        case "ellipse":
          i = h.cx - h.rx;
          j = h.cy - h.ry;
          k = h.rx * 2;
          l = h.ry * 2;
          break;
        case "image":
          i = +h.x;
          j = +h.y;
          k = h.width || 0;
          l = h.height || 0;
          break;
        case "text":
          this.textpath.v = [
            "m",
            Q(h.x),
            ", ",
            Q(h.y - 2),
            "l",
            Q(h.x) + 1,
            ", ",
            Q(h.y - 2),
          ][v](p);
          i = h.x - Q(this.W / 2);
          j = h.y - this.H / 2;
          k = this.W;
          l = this.H;
          break;
        case "rect":
        case "path":
          if (this.attrs.path) {
            var m = bn(this.attrs.path);
            i = m.x;
            j = m.y;
            k = m.width;
            l = m.height;
          } else {
            i = 0;
            j = 0;
            k = this.paper.width;
            l = this.paper.height;
          }
          break;
        default:
          i = 0;
          j = 0;
          k = this.paper.width;
          l = this.paper.height;
          break;
      }
      b = b == null ? i + k / 2 : b;
      c = c == null ? j + l / 2 : c;
      var n = b - this.paper.width / 2,
        o = c - this.paper.height / 2,
        q;
      d.left != (q = n + "px") && (d.left = q);
      d.top != (q = o + "px") && (d.top = q);
      this.X = ca[f](this.type) ? -n : i;
      this.Y = ca[f](this.type) ? -o : j;
      this.W = k;
      this.H = l;
      if (ca[f](this.type)) {
        e.left != (q = -n * b_ + "px") && (e.left = q);
        e.top != (q = -o * b_ + "px") && (e.top = q);
      } else if (this.type == "text") {
        e.left != (q = -n + "px") && (e.left = q);
        e.top != (q = -o + "px") && (e.top = q);
      } else {
        d.width != (q = this.paper.width + "px") && (d.width = q);
        d.height != (q = this.paper.height + "px") && (d.height = q);
        e.left != (q = i - n + "px") && (e.left = q);
        e.top != (q = j - o + "px") && (e.top = q);
        e.width != (q = k + "px") && (e.width = q);
        e.height != (q = l + "px") && (e.height = q);
      }
    };
    bO.hide = function () {
      !this.removed && (this.Group.style.display = "none");
      return this;
    };
    bO.show = function () {
      !this.removed && (this.Group.style.display = "block");
      return this;
    };
    bO.getBBox = function () {
      if (this.removed) return this;
      if (ca[f](this.type)) return bn(this.attrs.path);
      return {
        x: this.X + (this.bbx || 0),
        y: this.Y,
        width: this.W,
        height: this.H,
      };
    };
    bO.remove = function () {
      if (this.removed) return;
      bA(this, this.paper);
      this.node.parentNode.removeChild(this.node);
      this.Group.parentNode.removeChild(this.Group);
      this.shape && this.shape.parentNode.removeChild(this.shape);
      for (var a in this) delete this[a];
      this.removed = true;
    };
    bO.attr = function (b, c) {
      if (this.removed) return this;
      if (b == null) {
        var d = {};
        for (var e in this.attrs) this.attrs[f](e) && (d[e] = this.attrs[e]);
        this._.rt.deg && (d.rotation = this.rotate());
        (this._.sx != 1 || this._.sy != 1) && (d.scale = this.scale());
        d.gradient &&
          d.fill == "none" &&
          (d.fill = d.gradient) &&
          delete d.gradient;
        return d;
      }
      if (c == null && a.is(b, "string")) {
        if (b == "translation") return cz.call(this);
        if (b == "rotation") return this.rotate();
        if (b == "scale") return this.scale();
        if (b == I && this.attrs.fill == "none" && this.attrs.gradient)
          return this.attrs.gradient;
        return this.attrs[b];
      }
      if (this.attrs && c == null && a.is(b, G)) {
        var g,
          h = {};
        for (e = 0, g = b[w]; e < g; e++) h[b[e]] = this.attr(b[e]);
        return h;
      }
      var i;
      if (c != null) {
        i = {};
        i[b] = c;
      }
      c == null && a.is(b, "object") && (i = b);
      if (i) {
        for (var j in this.paper.customAttributes)
          if (
            this.paper.customAttributes[f](j) &&
            i[f](j) &&
            a.is(this.paper.customAttributes[j], "function")
          ) {
            var k = this.paper.customAttributes[j].apply(this, [][n](i[j]));
            this.attrs[j] = i[j];
            for (var l in k) k[f](l) && (i[l] = k[l]);
          }
        i.text && this.type == "text" && (this.node.string = i.text);
        bK(this, i);
        i.gradient &&
          ({ circle: 1, ellipse: 1 }[f](this.type) ||
            r(i.gradient).charAt() != "r") &&
          bI(this, i.gradient);
        (!ca[f](this.type) || this._.rt.deg) && this.setBox(this.attrs);
      }
      return this;
    };
    bO.toFront = function () {
      !this.removed && this.Group.parentNode[l](this.Group);
      this.paper.top != this && bB(this, this.paper);
      return this;
    };
    bO.toBack = function () {
      if (this.removed) return this;
      if (this.Group.parentNode.firstChild != this.Group) {
        this.Group.parentNode.insertBefore(
          this.Group,
          this.Group.parentNode.firstChild
        );
        bC(this, this.paper);
      }
      return this;
    };
    bO.insertAfter = function (a) {
      if (this.removed) return this;
      a.constructor == cC && (a = a[a.length - 1]);
      a.Group.nextSibling
        ? a.Group.parentNode.insertBefore(this.Group, a.Group.nextSibling)
        : a.Group.parentNode[l](this.Group);
      bD(this, a, this.paper);
      return this;
    };
    bO.insertBefore = function (a) {
      if (this.removed) return this;
      a.constructor == cC && (a = a[0]);
      a.Group.parentNode.insertBefore(this.Group, a.Group);
      bE(this, a, this.paper);
      return this;
    };
    bO.blur = function (b) {
      var c = this.node.runtimeStyle,
        d = c.filter;
      d = d.replace(bY, p);
      if (+b !== 0) {
        this.attrs.blur = b;
        c.filter = d + q + U + ".Blur(pixelradius=" + (+b || 1.5) + ")";
        c.margin = a.format("-{0}px 0 0 -{0}px", Q(+b || 1.5));
      } else {
        c.filter = d;
        c.margin = 0;
        delete this.attrs.blur;
      }
    };
    bP = function (a, b, c, d) {
      var e = cd("group"),
        f = cd("oval"),
        g = f.style;
      e.style.cssText =
        "position:absolute;left:0;top:0;width:" +
        a.width +
        "px;height:" +
        a.height +
        "px";
      e.coordsize = b$;
      e.coordorigin = a.coordorigin;
      e[l](f);
      var h = new bN(f, e, a);
      h.type = "circle";
      bK(h, { stroke: "#000", fill: "none" });
      h.attrs.cx = b;
      h.attrs.cy = c;
      h.attrs.r = d;
      h.setBox({ x: b - d, y: c - d, width: d * 2, height: d * 2 });
      a.canvas[l](e);
      return h;
    };
    function cc(b, c, d, e, f) {
      return f
        ? a.format(
            "M{0},{1}l{2},0a{3},{3},0,0,1,{3},{3}l0,{5}a{3},{3},0,0,1,{4},{3}l{6},0a{3},{3},0,0,1,{4},{4}l0,{7}a{3},{3},0,0,1,{3},{4}z",
            b + f,
            c,
            d - f * 2,
            f,
            -f,
            e - f * 2,
            f * 2 - d,
            f * 2 - e
          )
        : a.format("M{0},{1}l{2},0,0,{3},{4},0z", b, c, d, e, -d);
    }
    bQ = function (a, b, c, d, e, f) {
      var g = cc(b, c, d, e, f),
        h = a.path(g),
        i = h.attrs;
      h.X = i.x = b;
      h.Y = i.y = c;
      h.W = i.width = d;
      h.H = i.height = e;
      i.r = f;
      i.path = g;
      h.type = "rect";
      return h;
    };
    bR = function (a, b, c, d, e) {
      var f = cd("group"),
        g = cd("oval"),
        h = g.style;
      f.style.cssText =
        "position:absolute;left:0;top:0;width:" +
        a.width +
        "px;height:" +
        a.height +
        "px";
      f.coordsize = b$;
      f.coordorigin = a.coordorigin;
      f[l](g);
      var i = new bN(g, f, a);
      i.type = "ellipse";
      bK(i, { stroke: "#000" });
      i.attrs.cx = b;
      i.attrs.cy = c;
      i.attrs.rx = d;
      i.attrs.ry = e;
      i.setBox({ x: b - d, y: c - e, width: d * 2, height: e * 2 });
      a.canvas[l](f);
      return i;
    };
    bS = function (a, b, c, d, e, f) {
      var g = cd("group"),
        h = cd("image");
      g.style.cssText =
        "position:absolute;left:0;top:0;width:" +
        a.width +
        "px;height:" +
        a.height +
        "px";
      g.coordsize = b$;
      g.coordorigin = a.coordorigin;
      h.src = b;
      g[l](h);
      var i = new bN(h, g, a);
      i.type = "image";
      i.attrs.src = b;
      i.attrs.x = c;
      i.attrs.y = d;
      i.attrs.w = e;
      i.attrs.h = f;
      i.setBox({ x: c, y: d, width: e, height: f });
      a.canvas[l](g);
      return i;
    };
    bT = function (b, c, d, e) {
      var f = cd("group"),
        g = cd("shape"),
        h = g.style,
        i = cd("path"),
        j = i.style,
        k = cd("textpath");
      f.style.cssText =
        "position:absolute;left:0;top:0;width:" +
        b.width +
        "px;height:" +
        b.height +
        "px";
      f.coordsize = b$;
      f.coordorigin = b.coordorigin;
      i.v = a.format("m{0},{1}l{2},{1}", Q(c * 10), Q(d * 10), Q(c * 10) + 1);
      i.textpathok = true;
      h.width = b.width;
      h.height = b.height;
      k.string = r(e);
      k.on = true;
      g[l](k);
      g[l](i);
      f[l](g);
      var m = new bN(k, f, b);
      m.shape = g;
      m.textpath = i;
      m.type = "text";
      m.attrs.text = e;
      m.attrs.x = c;
      m.attrs.y = d;
      m.attrs.w = 1;
      m.attrs.h = 1;
      bK(m, { font: W.font, stroke: "none", fill: "#000" });
      m.setBox();
      b.canvas[l](f);
      return m;
    };
    bU = function (a, b) {
      var c = this.canvas.style;
      a == +a && (a += "px");
      b == +b && (b += "px");
      c.width = a;
      c.height = b;
      c.clip = "rect(0 " + a + " " + b + " 0)";
      return this;
    };
    var cd;
    g.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
    try {
      !g.namespaces.rvml &&
        g.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
      cd = function (a) {
        return g.createElement("<rvml:" + a + ' class="rvml">');
      };
    } catch (a) {
      cd = function (a) {
        return g.createElement(
          "<" + a + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">'
        );
      };
    }
    bV = function () {
      var b = by[m](0, arguments),
        c = b.container,
        d = b.height,
        e,
        f = b.width,
        h = b.x,
        i = b.y;
      if (!c) throw new Error("VML container not found.");
      var k = new j(),
        n = (k.canvas = g.createElement("div")),
        o = n.style;
      h = h || 0;
      i = i || 0;
      f = f || 512;
      d = d || 342;
      f == +f && (f += "px");
      d == +d && (d += "px");
      k.width = 1000;
      k.height = 1000;
      k.coordsize = b_ * 1000 + q + b_ * 1000;
      k.coordorigin = "0 0";
      k.span = g.createElement("span");
      k.span.style.cssText =
        "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
      n[l](k.span);
      o.cssText = a.format(
        "top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden",
        f,
        d
      );
      if (c == 1) {
        g.body[l](n);
        o.left = h + "px";
        o.top = i + "px";
        o.position = "absolute";
      } else c.firstChild ? c.insertBefore(n, c.firstChild) : c[l](n);
      bz.call(k, k, a.fn);
      return k;
    };
    k.clear = function () {
      this.canvas.innerHTML = p;
      this.span = g.createElement("span");
      this.span.style.cssText =
        "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
      this.canvas[l](this.span);
      this.bottom = this.top = null;
    };
    k.remove = function () {
      this.canvas.parentNode.removeChild(this.canvas);
      for (var a in this) this[a] = bF(a);
      return true;
    };
  }
  var ce = navigator.userAgent.match(/Version\\x2f(.*?)\s/);
  navigator.vendor == "Apple Computer, Inc." &&
  ((ce && ce[1] < 4) || navigator.platform.slice(0, 2) == "iP")
    ? (k.safari = function () {
        var a = this.rect(-99, -99, this.width + 99, this.height + 99).attr({
          stroke: "none",
        });
        h.setTimeout(function () {
          a.remove();
        });
      })
    : (k.safari = function () {});
  var cf = function () {
      this.returnValue = false;
    },
    cg = function () {
      return this.originalEvent.preventDefault();
    },
    ch = function () {
      this.cancelBubble = true;
    },
    ci = function () {
      return this.originalEvent.stopPropagation();
    },
    cj = (function () {
      {
        if (g.addEventListener)
          return function (a, b, c, d) {
            var e = o && u[b] ? u[b] : b,
              g = function (e) {
                if (o && u[f](b))
                  for (
                    var g = 0, h = e.targetTouches && e.targetTouches.length;
                    g < h;
                    g++
                  ) {
                    if (e.targetTouches[g].target == a) {
                      var i = e;
                      e = e.targetTouches[g];
                      e.originalEvent = i;
                      e.preventDefault = cg;
                      e.stopPropagation = ci;
                      break;
                    }
                  }
                return c.call(d, e);
              };
            a.addEventListener(e, g, false);
            return function () {
              a.removeEventListener(e, g, false);
              return true;
            };
          };
        if (g.attachEvent)
          return function (a, b, c, d) {
            var e = function (a) {
              a = a || h.event;
              a.preventDefault = a.preventDefault || cf;
              a.stopPropagation = a.stopPropagation || ch;
              return c.call(d, a);
            };
            a.attachEvent("on" + b, e);
            var f = function () {
              a.detachEvent("on" + b, e);
              return true;
            };
            return f;
          };
      }
    })(),
    ck = [],
    cl = function (a) {
      var b = a.clientX,
        c = a.clientY,
        d = g.documentElement.scrollTop || g.body.scrollTop,
        e = g.documentElement.scrollLeft || g.body.scrollLeft,
        f,
        h = ck.length;
      while (h--) {
        f = ck[h];
        if (o) {
          var i = a.touches.length,
            j;
          while (i--) {
            j = a.touches[i];
            if (j.identifier == f.el._drag.id) {
              b = j.clientX;
              c = j.clientY;
              (a.originalEvent ? a.originalEvent : a).preventDefault();
              break;
            }
          }
        } else a.preventDefault();
        b += e;
        c += d;
        f.move &&
          f.move.call(
            f.move_scope || f.el,
            b - f.el._drag.x,
            c - f.el._drag.y,
            b,
            c,
            a
          );
      }
    },
    cm = function (b) {
      a.unmousemove(cl).unmouseup(cm);
      var c = ck.length,
        d;
      while (c--) {
        d = ck[c];
        d.el._drag = {};
        d.end &&
          d.end.call(d.end_scope || d.start_scope || d.move_scope || d.el, b);
      }
      ck = [];
    };
  for (var cn = t[w]; cn--; )
    (function (b) {
      a[b] = bN[e][b] = function (c, d) {
        if (a.is(c, "function")) {
          this.events = this.events || [];
          this.events.push({
            name: b,
            f: c,
            unbind: cj(this.shape || this.node || g, b, c, d || this),
          });
        }
        return this;
      };
      a["un" + b] = bN[e]["un" + b] = function (a) {
        var c = this.events,
          d = c[w];
        while (d--)
          if (c[d].name == b && c[d].f == a) {
            c[d].unbind();
            c.splice(d, 1);
            !c.length && delete this.events;
            return this;
          }
        return this;
      };
    })(t[cn]);
  bO.hover = function (a, b, c, d) {
    return this.mouseover(a, c).mouseout(b, d || c);
  };
  bO.unhover = function (a, b) {
    return this.unmouseover(a).unmouseout(b);
  };
  bO.drag = function (b, c, d, e, f, h) {
    this._drag = {};
    this.mousedown(function (i) {
      (i.originalEvent || i).preventDefault();
      var j = g.documentElement.scrollTop || g.body.scrollTop,
        k = g.documentElement.scrollLeft || g.body.scrollLeft;
      this._drag.x = i.clientX + k;
      this._drag.y = i.clientY + j;
      this._drag.id = i.identifier;
      c && c.call(f || e || this, i.clientX + k, i.clientY + j, i);
      !ck.length && a.mousemove(cl).mouseup(cm);
      ck.push({
        el: this,
        move: b,
        end: d,
        move_scope: e,
        start_scope: f,
        end_scope: h,
      });
    });
    return this;
  };
  bO.undrag = function (b, c, d) {
    var e = ck.length;
    while (e--)
      ck[e].el == this &&
        ck[e].move == b &&
        ck[e].end == d &&
        ck.splice(e++, 1);
    !ck.length && a.unmousemove(cl).unmouseup(cm);
  };
  k.circle = function (a, b, c) {
    return bP(this, a || 0, b || 0, c || 0);
  };
  k.rect = function (a, b, c, d, e) {
    return bQ(this, a || 0, b || 0, c || 0, d || 0, e || 0);
  };
  k.ellipse = function (a, b, c, d) {
    return bR(this, a || 0, b || 0, c || 0, d || 0);
  };
  k.path = function (b) {
    b && !a.is(b, F) && !a.is(b[0], G) && (b += p);
    return bH(a.format[m](a, arguments), this);
  };
  k.image = function (a, b, c, d, e) {
    return bS(this, a || "about:blank", b || 0, c || 0, d || 0, e || 0);
  };
  k.text = function (a, b, c) {
    return bT(this, a || 0, b || 0, r(c));
  };
  k.set = function (a) {
    arguments[w] > 1 && (a = Array[e].splice.call(arguments, 0, arguments[w]));
    return new cC(a);
  };
  k.setSize = bU;
  k.top = k.bottom = null;
  k.raphael = a;
  function co() {
    return this.x + q + this.y;
  }
  bO.resetScale = function () {
    if (this.removed) return this;
    this._.sx = 1;
    this._.sy = 1;
    this.attrs.scale = "1 1";
  };
  bO.scale = function (a, b, c, d) {
    if (this.removed) return this;
    if (a == null && b == null)
      return { x: this._.sx, y: this._.sy, toString: co };
    b = b || a;
    !+b && (b = a);
    var e,
      f,
      g,
      h,
      i = this.attrs;
    if (a != 0) {
      var j = this.getBBox(),
        k = j.x + j.width / 2,
        l = j.y + j.height / 2,
        m = B(a / this._.sx),
        o = B(b / this._.sy);
      c = +c || c == 0 ? c : k;
      d = +d || d == 0 ? d : l;
      var r = this._.sx > 0,
        s = this._.sy > 0,
        t = ~~(a / B(a)),
        u = ~~(b / B(b)),
        x = m * t,
        y = o * u,
        z = this.node.style,
        A = c + B(k - c) * x * (k > c == r ? 1 : -1),
        C = d + B(l - d) * y * (l > d == s ? 1 : -1),
        D = a * t > b * u ? o : m;
      switch (this.type) {
        case "rect":
        case "image":
          var E = i.width * m,
            F = i.height * o;
          this.attr({
            height: F,
            r: i.r * D,
            width: E,
            x: A - E / 2,
            y: C - F / 2,
          });
          break;
        case "circle":
        case "ellipse":
          this.attr({ rx: i.rx * m, ry: i.ry * o, r: i.r * D, cx: A, cy: C });
          break;
        case "text":
          this.attr({ x: A, y: C });
          break;
        case "path":
          var G = bp(i.path),
            H = true,
            I = r ? x : m,
            J = s ? y : o;
          for (var K = 0, L = G[w]; K < L; K++) {
            var M = G[K],
              N = V.call(M[0]);
            {
              if (N == "M" && H) continue;
              H = false;
            }
            if (N == "A") {
              M[G[K][w] - 2] *= I;
              M[G[K][w] - 1] *= J;
              M[1] *= m;
              M[2] *= o;
              M[5] = +(t + u ? !!+M[5] : !+M[5]);
            } else if (N == "H")
              for (var O = 1, P = M[w]; O < P; O++) M[O] *= I;
            else if (N == "V") for (O = 1, P = M[w]; O < P; O++) M[O] *= J;
            else for (O = 1, P = M[w]; O < P; O++) M[O] *= O % 2 ? I : J;
          }
          var Q = bn(G);
          e = A - Q.x - Q.width / 2;
          f = C - Q.y - Q.height / 2;
          G[0][1] += e;
          G[0][2] += f;
          this.attr({ path: G });
          break;
      }
      if (this.type in { text: 1, image: 1 } && (t != 1 || u != 1))
        if (this.transformations) {
          this.transformations[2] = "scale("[n](t, ",", u, ")");
          this.node[R]("transform", this.transformations[v](q));
          e = t == -1 ? -i.x - (E || 0) : i.x;
          f = u == -1 ? -i.y - (F || 0) : i.y;
          this.attr({ x: e, y: f });
          i.fx = t - 1;
          i.fy = u - 1;
        } else {
          this.node.filterMatrix =
            U +
            ".Matrix(M11="[n](
              t,
              ", M12=0, M21=0, M22=",
              u,
              ", Dx=0, Dy=0, sizingmethod='auto expand', filtertype='bilinear')"
            );
          z.filter =
            (this.node.filterMatrix || p) + (this.node.filterOpacity || p);
        }
      else if (this.transformations) {
        this.transformations[2] = p;
        this.node[R]("transform", this.transformations[v](q));
        i.fx = 0;
        i.fy = 0;
      } else {
        this.node.filterMatrix = p;
        z.filter =
          (this.node.filterMatrix || p) + (this.node.filterOpacity || p);
      }
      i.scale = [a, b, c, d][v](q);
      this._.sx = a;
      this._.sy = b;
    }
    return this;
  };
  bO.clone = function () {
    if (this.removed) return null;
    var a = this.attr();
    delete a.scale;
    delete a.translation;
    return this.paper[this.type]().attr(a);
  };
  var cp = {},
    cq = function (b, c, d, e, f, g, h, i, j) {
      var k = 0,
        l = 100,
        m = [b, c, d, e, f, g, h, i].join(),
        n = cp[m],
        o,
        p;
      !n && (cp[m] = n = { data: [] });
      n.timer && clearTimeout(n.timer);
      n.timer = setTimeout(function () {
        delete cp[m];
      }, 2000);
      if (j != null) {
        var q = cq(b, c, d, e, f, g, h, i);
        l = ~~q * 10;
      }
      for (var r = 0; r < l + 1; r++) {
        if (n.data[j] > r) p = n.data[r * l];
        else {
          p = a.findDotsAtSegment(b, c, d, e, f, g, h, i, r / l);
          n.data[r] = p;
        }
        r && (k += C(C(o.x - p.x, 2) + C(o.y - p.y, 2), 0.5));
        if (j != null && k >= j) return p;
        o = p;
      }
      if (j == null) return k;
    },
    cr = function (b, c) {
      return function (d, e, f) {
        d = bw(d);
        var g,
          h,
          i,
          j,
          k = "",
          l = {},
          m,
          n = 0;
        for (var o = 0, p = d.length; o < p; o++) {
          i = d[o];
          if (i[0] == "M") {
            g = +i[1];
            h = +i[2];
          } else {
            j = cq(g, h, i[1], i[2], i[3], i[4], i[5], i[6]);
            if (n + j > e) {
              if (c && !l.start) {
                m = cq(g, h, i[1], i[2], i[3], i[4], i[5], i[6], e - n);
                k += ["C", m.start.x, m.start.y, m.m.x, m.m.y, m.x, m.y];
                if (f) return k;
                l.start = k;
                k = [
                  "M",
                  m.x,
                  m.y + "C",
                  m.n.x,
                  m.n.y,
                  m.end.x,
                  m.end.y,
                  i[5],
                  i[6],
                ][v]();
                n += j;
                g = +i[5];
                h = +i[6];
                continue;
              }
              if (!b && !c) {
                m = cq(g, h, i[1], i[2], i[3], i[4], i[5], i[6], e - n);
                return { x: m.x, y: m.y, alpha: m.alpha };
              }
            }
            n += j;
            g = +i[5];
            h = +i[6];
          }
          k += i;
        }
        l.end = k;
        m = b
          ? n
          : c
          ? l
          : a.findDotsAtSegment(g, h, i[1], i[2], i[3], i[4], i[5], i[6], 1);
        m.alpha && (m = { x: m.x, y: m.y, alpha: m.alpha });
        return m;
      };
    },
    cs = cr(1),
    ct = cr(),
    cu = cr(0, 1);
  bO.getTotalLength = function () {
    if (this.type != "path") return;
    if (this.node.getTotalLength) return this.node.getTotalLength();
    return cs(this.attrs.path);
  };
  bO.getPointAtLength = function (a) {
    if (this.type != "path") return;
    return ct(this.attrs.path, a);
  };
  bO.getSubpath = function (a, b) {
    if (this.type != "path") return;
    if (B(this.getTotalLength() - b) < "1e-6")
      return cu(this.attrs.path, a).end;
    var c = cu(this.attrs.path, b, 1);
    return a ? cu(c, a).end : c;
  };
  a.easing_formulas = {
    linear: function (a) {
      return a;
    },
    "<": function (a) {
      return C(a, 3);
    },
    ">": function (a) {
      return C(a - 1, 3) + 1;
    },
    "<>": function (a) {
      a = a * 2;
      if (a < 1) return C(a, 3) / 2;
      a -= 2;
      return (C(a, 3) + 2) / 2;
    },
    backIn: function (a) {
      var b = 1.70158;
      return a * a * ((b + 1) * a - b);
    },
    backOut: function (a) {
      a = a - 1;
      var b = 1.70158;
      return a * a * ((b + 1) * a + b) + 1;
    },
    elastic: function (a) {
      if (a == 0 || a == 1) return a;
      var b = 0.3,
        c = b / 4;
      return C(2, -10 * a) * y.sin(((a - c) * (2 * D)) / b) + 1;
    },
    bounce: function (a) {
      var b = 7.5625,
        c = 2.75,
        d;
      if (a < 1 / c) d = b * a * a;
      else if (a < 2 / c) {
        a -= 1.5 / c;
        d = b * a * a + 0.75;
      } else if (a < 2.5 / c) {
        a -= 2.25 / c;
        d = b * a * a + 0.9375;
      } else {
        a -= 2.625 / c;
        d = b * a * a + 0.984375;
      }
      return d;
    },
  };
  var cv = [],
    cw = function () {
      var b = +new Date();
      for (var c = 0; c < cv[w]; c++) {
        var d = cv[c];
        if (d.stop || d.el.removed) continue;
        var e = b - d.start,
          g = d.ms,
          h = d.easing,
          i = d.from,
          j = d.diff,
          k = d.to,
          l = d.t,
          m = d.el,
          n = {},
          o;
        if (e < g) {
          var r = h(e / g);
          for (var s in i)
            if (i[f](s)) {
              switch (X[s]) {
                case "along":
                  o = r * g * j[s];
                  k.back && (o = k.len - o);
                  var t = ct(k[s], o);
                  m.translate(j.sx - j.x || 0, j.sy - j.y || 0);
                  j.x = t.x;
                  j.y = t.y;
                  m.translate(t.x - j.sx, t.y - j.sy);
                  k.rot && m.rotate(j.r + t.alpha, t.x, t.y);
                  break;
                case E:
                  o = +i[s] + r * g * j[s];
                  break;
                case "colour":
                  o =
                    "rgb(" +
                    [
                      cy(Q(i[s].r + r * g * j[s].r)),
                      cy(Q(i[s].g + r * g * j[s].g)),
                      cy(Q(i[s].b + r * g * j[s].b)),
                    ][v](",") +
                    ")";
                  break;
                case "path":
                  o = [];
                  for (var u = 0, x = i[s][w]; u < x; u++) {
                    o[u] = [i[s][u][0]];
                    for (var y = 1, z = i[s][u][w]; y < z; y++)
                      o[u][y] = +i[s][u][y] + r * g * j[s][u][y];
                    o[u] = o[u][v](q);
                  }
                  o = o[v](q);
                  break;
                case "csv":
                  switch (s) {
                    case "translation":
                      var A = r * g * j[s][0] - l.x,
                        B = r * g * j[s][1] - l.y;
                      l.x += A;
                      l.y += B;
                      o = A + q + B;
                      break;
                    case "rotation":
                      o = +i[s][0] + r * g * j[s][0];
                      i[s][1] && (o += "," + i[s][1] + "," + i[s][2]);
                      break;
                    case "scale":
                      o = [
                        +i[s][0] + r * g * j[s][0],
                        +i[s][1] + r * g * j[s][1],
                        2 in k[s] ? k[s][2] : p,
                        3 in k[s] ? k[s][3] : p,
                      ][v](q);
                      break;
                    case "clip-rect":
                      o = [];
                      u = 4;
                      while (u--) o[u] = +i[s][u] + r * g * j[s][u];
                      break;
                  }
                  break;
                default:
                  var C = [].concat(i[s]);
                  o = [];
                  u = m.paper.customAttributes[s].length;
                  while (u--) o[u] = +C[u] + r * g * j[s][u];
                  break;
              }
              n[s] = o;
            }
          m.attr(n);
          m._run && m._run.call(m);
        } else {
          if (k.along) {
            t = ct(k.along, k.len * !k.back);
            m.translate(
              j.sx - (j.x || 0) + t.x - j.sx,
              j.sy - (j.y || 0) + t.y - j.sy
            );
            k.rot && m.rotate(j.r + t.alpha, t.x, t.y);
          }
          (l.x || l.y) && m.translate(-l.x, -l.y);
          k.scale && (k.scale += p);
          m.attr(k);
          cv.splice(c--, 1);
        }
      }
      a.svg && m && m.paper && m.paper.safari();
      cv[w] && setTimeout(cw);
    },
    cx = function (b, c, d, e, f) {
      var g = d - e;
      c.timeouts.push(
        setTimeout(function () {
          a.is(f, "function") && f.call(c);
          c.animate(b, g, b.easing);
        }, e)
      );
    },
    cy = function (a) {
      return z(A(a, 255), 0);
    },
    cz = function (a, b) {
      if (a == null) return { x: this._.tx, y: this._.ty, toString: co };
      this._.tx += +a;
      this._.ty += +b;
      switch (this.type) {
        case "circle":
        case "ellipse":
          this.attr({ cx: +a + this.attrs.cx, cy: +b + this.attrs.cy });
          break;
        case "rect":
        case "image":
        case "text":
          this.attr({ x: +a + this.attrs.x, y: +b + this.attrs.y });
          break;
        case "path":
          var c = bp(this.attrs.path);
          c[0][1] += +a;
          c[0][2] += +b;
          this.attr({ path: c });
          break;
      }
      return this;
    };
  bO.animateWith = function (a, b, c, d, e) {
    for (var f = 0, g = cv.length; f < g; f++)
      cv[f].el.id == a.id && (b.start = cv[f].start);
    return this.animate(b, c, d, e);
  };
  bO.animateAlong = cA();
  bO.animateAlongBack = cA(1);
  function cA(b) {
    return function (c, d, e, f) {
      var g = { back: b };
      a.is(e, "function") ? (f = e) : (g.rot = e);
      c && c.constructor == bN && (c = c.attrs.path);
      c && (g.along = c);
      return this.animate(g, d, f);
    };
  }
  function cB(a, b, c, d, e, f) {
    var g = 3 * b,
      h = 3 * (d - b) - g,
      i = 1 - g - h,
      j = 3 * c,
      k = 3 * (e - c) - j,
      l = 1 - j - k;
    function m(a) {
      return ((i * a + h) * a + g) * a;
    }
    function n(a, b) {
      var c = o(a, b);
      return ((l * c + k) * c + j) * c;
    }
    function o(a, b) {
      var c, d, e, f, j, k;
      for (e = a, k = 0; k < 8; k++) {
        f = m(e) - a;
        if (B(f) < b) return e;
        j = (3 * i * e + 2 * h) * e + g;
        if (B(j) < 0.000001) break;
        e = e - f / j;
      }
      c = 0;
      d = 1;
      e = a;
      if (e < c) return c;
      if (e > d) return d;
      while (c < d) {
        f = m(e);
        if (B(f - a) < b) return e;
        a > f ? (c = e) : (d = e);
        e = (d - c) / 2 + c;
      }
      return e;
    }
    return n(a, 1 / (200 * f));
  }
  bO.onAnimation = function (a) {
    this._run = a || 0;
    return this;
  };
  bO.animate = function (c, d, e, g) {
    var h = this;
    h.timeouts = h.timeouts || [];
    if (a.is(e, "function") || !e) g = e || null;
    if (h.removed) {
      g && g.call(h);
      return h;
    }
    var i = {},
      j = {},
      k = false,
      l = {};
    for (var m in c)
      if (c[f](m)) {
        if (X[f](m) || h.paper.customAttributes[f](m)) {
          k = true;
          i[m] = h.attr(m);
          i[m] == null && (i[m] = W[m]);
          j[m] = c[m];
          switch (X[m]) {
            case "along":
              var n = cs(c[m]),
                o = ct(c[m], n * !!c.back),
                p = h.getBBox();
              l[m] = n / d;
              l.tx = p.x;
              l.ty = p.y;
              l.sx = o.x;
              l.sy = o.y;
              j.rot = c.rot;
              j.back = c.back;
              j.len = n;
              c.rot && (l.r = S(h.rotate()) || 0);
              break;
            case E:
              l[m] = (j[m] - i[m]) / d;
              break;
            case "colour":
              i[m] = a.getRGB(i[m]);
              var q = a.getRGB(j[m]);
              l[m] = {
                r: (q.r - i[m].r) / d,
                g: (q.g - i[m].g) / d,
                b: (q.b - i[m].b) / d,
              };
              break;
            case "path":
              var t = bw(i[m], j[m]);
              i[m] = t[0];
              var u = t[1];
              l[m] = [];
              for (var v = 0, x = i[m][w]; v < x; v++) {
                l[m][v] = [0];
                for (var y = 1, z = i[m][v][w]; y < z; y++)
                  l[m][v][y] = (u[v][y] - i[m][v][y]) / d;
              }
              break;
            case "csv":
              var A = r(c[m])[s](b),
                B = r(i[m])[s](b);
              switch (m) {
                case "translation":
                  i[m] = [0, 0];
                  l[m] = [A[0] / d, A[1] / d];
                  break;
                case "rotation":
                  i[m] = B[1] == A[1] && B[2] == A[2] ? B : [0, A[1], A[2]];
                  l[m] = [(A[0] - i[m][0]) / d, 0, 0];
                  break;
                case "scale":
                  c[m] = A;
                  i[m] = r(i[m])[s](b);
                  l[m] = [(A[0] - i[m][0]) / d, (A[1] - i[m][1]) / d, 0, 0];
                  break;
                case "clip-rect":
                  i[m] = r(i[m])[s](b);
                  l[m] = [];
                  v = 4;
                  while (v--) l[m][v] = (A[v] - i[m][v]) / d;
                  break;
              }
              j[m] = A;
              break;
            default:
              A = [].concat(c[m]);
              B = [].concat(i[m]);
              l[m] = [];
              v = h.paper.customAttributes[m][w];
              while (v--) l[m][v] = ((A[v] || 0) - (B[v] || 0)) / d;
              break;
          }
        }
      }
    if (k) {
      var G = a.easing_formulas[e];
      if (!G) {
        G = r(e).match(P);
        if (G && G[w] == 5) {
          var H = G;
          G = function (a) {
            return cB(a, +H[1], +H[2], +H[3], +H[4], d);
          };
        } else
          G = function (a) {
            return a;
          };
      }
      cv.push({
        start: c.start || +new Date(),
        ms: d,
        easing: G,
        from: i,
        diff: l,
        to: j,
        el: h,
        t: { x: 0, y: 0 },
      });
      a.is(g, "function") &&
        (h._ac = setTimeout(function () {
          g.call(h);
        }, d));
      cv[w] == 1 && setTimeout(cw);
    } else {
      var C = [],
        D;
      for (var F in c)
        if (c[f](F) && Z.test(F)) {
          m = { value: c[F] };
          F == "from" && (F = 0);
          F == "to" && (F = 100);
          m.key = T(F, 10);
          C.push(m);
        }
      C.sort(be);
      C[0].key && C.unshift({ key: 0, value: h.attrs });
      for (v = 0, x = C[w]; v < x; v++)
        cx(
          C[v].value,
          h,
          (d / 100) * C[v].key,
          (d / 100) * ((C[v - 1] && C[v - 1].key) || 0),
          C[v - 1] && C[v - 1].value.callback
        );
      D = C[C[w] - 1].value.callback;
      D &&
        h.timeouts.push(
          setTimeout(function () {
            D.call(h);
          }, d)
        );
    }
    return this;
  };
  bO.stop = function () {
    for (var a = 0; a < cv.length; a++)
      cv[a].el.id == this.id && cv.splice(a--, 1);
    for (a = 0, ii = this.timeouts && this.timeouts.length; a < ii; a++)
      clearTimeout(this.timeouts[a]);
    this.timeouts = [];
    clearTimeout(this._ac);
    delete this._ac;
    return this;
  };
  bO.translate = function (a, b) {
    return this.attr({ translation: a + " " + b });
  };
  bO[H] = function () {
    return "Raphaël’s object";
  };
  a.ae = cv;
  var cC = function (a) {
    this.items = [];
    this[w] = 0;
    this.type = "set";
    if (a)
      for (var b = 0, c = a[w]; b < c; b++) {
        if (a[b] && (a[b].constructor == bN || a[b].constructor == cC)) {
          this[this.items[w]] = this.items[this.items[w]] = a[b];
          this[w]++;
        }
      }
  };
  cC[e][L] = function () {
    var a, b;
    for (var c = 0, d = arguments[w]; c < d; c++) {
      a = arguments[c];
      if (a && (a.constructor == bN || a.constructor == cC)) {
        b = this.items[w];
        this[b] = this.items[b] = a;
        this[w]++;
      }
    }
    return this;
  };
  cC[e].pop = function () {
    delete this[this[w]--];
    return this.items.pop();
  };
  for (var cD in bO)
    bO[f](cD) &&
      (cC[e][cD] = (function (a) {
        return function () {
          for (var b = 0, c = this.items[w]; b < c; b++)
            this.items[b][a][m](this.items[b], arguments);
          return this;
        };
      })(cD));
  cC[e].attr = function (b, c) {
    if (b && a.is(b, G) && a.is(b[0], "object"))
      for (var d = 0, e = b[w]; d < e; d++) this.items[d].attr(b[d]);
    else
      for (var f = 0, g = this.items[w]; f < g; f++) this.items[f].attr(b, c);
    return this;
  };
  cC[e].animate = function (b, c, d, e) {
    (a.is(d, "function") || !d) && (e = d || null);
    var f = this.items[w],
      g = f,
      h,
      i = this,
      j;
    e &&
      (j = function () {
        !--f && e.call(i);
      });
    d = a.is(d, F) ? d : j;
    h = this.items[--g].animate(b, c, d, j);
    while (g--)
      this.items[g] &&
        !this.items[g].removed &&
        this.items[g].animateWith(h, b, c, d, j);
    return this;
  };
  cC[e].insertAfter = function (a) {
    var b = this.items[w];
    while (b--) this.items[b].insertAfter(a);
    return this;
  };
  cC[e].getBBox = function () {
    var a = [],
      b = [],
      c = [],
      d = [];
    for (var e = this.items[w]; e--; ) {
      var f = this.items[e].getBBox();
      a[L](f.x);
      b[L](f.y);
      c[L](f.x + f.width);
      d[L](f.y + f.height);
    }
    a = A[m](0, a);
    b = A[m](0, b);
    return { x: a, y: b, width: z[m](0, c) - a, height: z[m](0, d) - b };
  };
  cC[e].clone = function (a) {
    a = new cC();
    for (var b = 0, c = this.items[w]; b < c; b++) a[L](this.items[b].clone());
    return a;
  };
  a.registerFont = function (a) {
    if (!a.face) return a;
    this.fonts = this.fonts || {};
    var b = { w: a.w, face: {}, glyphs: {} },
      c = a.face["font-family"];
    for (var d in a.face) a.face[f](d) && (b.face[d] = a.face[d]);
    this.fonts[c] ? this.fonts[c][L](b) : (this.fonts[c] = [b]);
    if (!a.svg) {
      b.face["units-per-em"] = T(a.face["units-per-em"], 10);
      for (var e in a.glyphs)
        if (a.glyphs[f](e)) {
          var g = a.glyphs[e];
          b.glyphs[e] = {
            w: g.w,
            k: {},
            d:
              g.d &&
              "M" +
                g.d[Y](/[mlcxtrv]/g, function (a) {
                  return (
                    { l: "L", c: "C", x: "z", t: "m", r: "l", v: "c" }[a] || "M"
                  );
                }) +
                "z",
          };
          if (g.k) for (var h in g.k) g[f](h) && (b.glyphs[e].k[h] = g.k[h]);
        }
    }
    return a;
  };
  k.getFont = function (b, c, d, e) {
    e = e || "normal";
    d = d || "normal";
    c = +c || { normal: 400, bold: 700, lighter: 300, bolder: 800 }[c] || 400;
    if (!a.fonts) return;
    var g = a.fonts[b];
    if (!g) {
      var h = new RegExp(
        "(^|\\s)" + b[Y](/[^\w\d\s+!~.:_-]/g, p) + "(\\s|$)",
        "i"
      );
      for (var i in a.fonts)
        if (a.fonts[f](i)) {
          if (h.test(i)) {
            g = a.fonts[i];
            break;
          }
        }
    }
    var j;
    if (g)
      for (var k = 0, l = g[w]; k < l; k++) {
        j = g[k];
        if (
          j.face["font-weight"] == c &&
          (j.face["font-style"] == d || !j.face["font-style"]) &&
          j.face["font-stretch"] == e
        )
          break;
      }
    return j;
  };
  k.print = function (c, d, e, f, g, h, i) {
    h = h || "middle";
    i = z(A(i || 0, 1), -1);
    var j = this.set(),
      k = r(e)[s](p),
      l = 0,
      m = p,
      n;
    a.is(f, e) && (f = this.getFont(f));
    if (f) {
      n = (g || 16) / f.face["units-per-em"];
      var o = f.face.bbox.split(b),
        q = +o[0],
        t =
          +o[1] +
          (h == "baseline" ? o[3] - o[1] + +f.face.descent : (o[3] - o[1]) / 2);
      for (var u = 0, v = k[w]; u < v; u++) {
        var x = (u && f.glyphs[k[u - 1]]) || {},
          y = f.glyphs[k[u]];
        l += u ? (x.w || f.w) + ((x.k && x.k[k[u]]) || 0) + f.w * i : 0;
        y &&
          y.d &&
          j[L](
            this.path(y.d).attr({
              fill: "#000",
              stroke: "none",
              translation: [l, 0],
            })
          );
      }
      j.scale(n, n, q, t).translate(c - q, d - t);
    }
    return j;
  };
  a.format = function (b, c) {
    var e = a.is(c, G) ? [0][n](c) : arguments;
    b &&
      a.is(b, F) &&
      e[w] - 1 &&
      (b = b[Y](d, function (a, b) {
        return e[++b] == null ? p : e[b];
      }));
    return b || p;
  };
  a.ninja = function () {
    i.was ? (h.Raphael = i.is) : delete Raphael;
    return a;
  };
  a.el = bO;
  a.st = cC[e];
  i.was ? (h.Raphael = a) : (Raphael = a);
})();
