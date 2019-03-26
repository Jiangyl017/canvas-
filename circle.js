function semicircle(id, per, strokeStartColor, strokeEndColor, circleRatio, startDeg) {

    var domId = id;
    var value = per || 0.015;// 0.5表示50%，1表示100%
    var strokeStartColor = strokeStartColor || "#EA4F3B";
    var strokeEndColor = strokeEndColor || strokeStartColor;
    var ringBgColor = '#eeeeee';
    var duration = 1000;// 动画持续时间
    var gradientStep = 100;// 渐变步数
    var circleRatio = circleRatio || 360 / 360;
    var targetValue = value * circleRatio;// 转为值在整个圆中的值
    var startDeg = startDeg || 270;
    var minDegree = 2.795;
    var node = $('#' + domId);

    var ratio = window.devicePixelRatio || 1;
    var rad = Math.PI / 180;
    var canvas = node[0];
    var size = node.innerWidth() * ratio;
    var lineWidth = Math.round(size * 0.1);// 渐变色环宽度为整个宽度的十分之一
    var lineWidth2 = lineWidth / 1;// 背景环和渐变色换宽度保持一致
    var r = size / 2;

    canvas.width = size;
    canvas.height = size * circleRatio + lineWidth / 2;

    /*
    * 设置文字
    * */
    var perTip = Math.round(per * 100) > 2 ? Math.round(per * 100) : 0;
    node.parents(".circle-box").find(".percent").html(perTip + "%");

    var context = canvas.getContext("2d");

    /*
      渐变色
      startColor：开始颜色hex
      endColor：结束颜色hex
      step:几个阶级（几步）
    */
    function GradientColor(startColor, endColor, step) {
        startRGB = this.colorRgb(startColor);//转换为rgb数组模式
        startR = startRGB[0];
        startG = startRGB[1];
        startB = startRGB[2];

        endRGB = this.colorRgb(endColor);
        endR = endRGB[0];
        endG = endRGB[1];
        endB = endRGB[2];

        sR = (endR - startR) / step;//总差值
        sG = (endG - startG) / step;
        sB = (endB - startB) / step;

        var colorArr = [];
        for (var i = 0; i < step; i++) {
            //计算每一步的hex值
            var hex = this.colorHex('rgb(' + parseInt((sR * i + startR)) + ',' + parseInt((sG * i + startG)) + ',' + parseInt((sB * i + startB)) + ')');
            colorArr.push(hex);
        }
        return colorArr;
    }

    // 将hex表示方式转换为rgb表示方式(这里返回rgb数组模式)
    GradientColor.prototype.colorRgb = function (sColor) {
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        var sColor = sColor.toLowerCase();
        if (sColor && reg.test(sColor)) {
            if (sColor.length === 4) {
                var sColorNew = "#";
                for (var i = 1; i < 4; i += 1) {
                    sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                }
                sColor = sColorNew;
            }
            //处理六位的颜色值
            var sColorChange = [];
            for (var i = 1; i < 7; i += 2) {
                sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
            }
            return sColorChange;
        } else {
            return sColor;
        }
    };
    // 将rgb表示方式转换为hex表示方式
    GradientColor.prototype.colorHex = function (rgb) {
        var _this = rgb;
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        if (/^(rgb|RGB)/.test(_this)) {
            var aColor = _this.replace(/(?:(|)|rgb|RGB)*/g, "").split(",");
            var strHex = "#";
            for (var i = 0; i < aColor.length; i++) {
                var hex = Number(aColor[i]).toString(16);
                hex = hex < 10 ? 0 + '' + hex : hex;// 保证每个rgb的值为2位
                if (hex === "0") {
                    hex += hex;
                }
                strHex += hex;
            }
            if (strHex.length !== 7) {
                strHex = _this;
            }
            return strHex;
        } else if (reg.test(_this)) {
            var aNum = _this.replace(/#/, "").split("");
            if (aNum.length === 6) {
                return _this;
            } else if (aNum.length === 3) {
                var numHex = "#";
                for (var i = 0; i < aNum.length; i += 1) {
                    numHex += (aNum[i] + aNum[i]);
                }
                return numHex;
            }
        } else {
            return _this;
        }
    };

    // 画
    function draw(degree, startDeg, strokeStartColor, strokeEndColor, bgColor) {
        if (degree < minDegree) {
            degree = minDegree;
        }
        clearRect();
        arcBorder(startDeg, bgColor);

        var gradientColor = new GradientColor(strokeStartColor, strokeEndColor, gradientStep);
        var intervalTime = duration / gradientStep;
        var gradientDegreeUnit = degree / gradientStep;

        var timeoutId = node.attr('data-timeoutId');
        try {
            timeoutId && clearTimeout(timeoutId);
        } catch (e) {
        }
        var timesIndex = 0;
        var lastOffsetDegree = 0;

        function intervalDrawArc() {
            timesIndex++;
            var _degree = gradientDegreeUnit;
            var offsetDegree = timesIndex * gradientDegreeUnit;
            if (offsetDegree >= degree) {
                _degree = _degree - (offsetDegree - degree);
                if (_degree < 0) {
                    _degree = 0;
                }
                offsetDegree = degree;
            }
            arc(_degree, startDeg + lastOffsetDegree, gradientColor[((timesIndex - 1) >= gradientStep) ? (gradientStep - 1) : (timesIndex - 1)]);
            if (offsetDegree >= degree) {
                node.removeAttr('data-timeoutId');
                return;
            }
            lastOffsetDegree = offsetDegree;
            timeoutId = setTimeout(intervalDrawArc, intervalTime);
            node.attr('data-timeoutId', timeoutId);
        }

        timeoutId = setTimeout(intervalDrawArc, intervalTime);
        node.attr('data-timeoutId', timeoutId);
    }

    //进度条圆弧
    function arc(degree, startDeg, color) {
        degree = Number(degree);
        context.save();

        context.beginPath();

        context.lineCap = "round";
        context.lineWidth = lineWidth;

        context.strokeStyle = color;

        context.arc(r, r, r - lineWidth / 2, startDeg * rad, (degree + startDeg) * rad, false);
        context.stroke();
        context.closePath();
        context.restore();
    }

    //灰色圆弧
    function arcBorder(startDeg, bgColor) {
        context.save();
        context.beginPath();

        context.lineCap = "round";
        context.lineWidth = lineWidth2;
        context.strokeStyle = bgColor;
        context.arc(r, r, r - lineWidth / 2, startDeg * rad, (360 * circleRatio + startDeg) * rad, false);
        context.stroke();
        context.closePath();
        context.restore();
    }

    //清空画布
    function clearRect() {
        context.clearRect(0, 0, size, size);
    }


    draw(360 * targetValue, startDeg, strokeStartColor, strokeEndColor, ringBgColor);

};