var Highcharts;
$(document).ready(function () {
    var dataObject1;
    $.ajax({
        url: "https://www.banxico.org.mx/SieInternet/consultaSerieGrafica.do?s=SI744,CI38",
        dataType: "json",
        async: false,
        cache: true,
        success: function (data) {
            dataObject1 = data;
        },
    });
    var datos1 = dataObject1.valores;

    function transforma1(arreglo) {
        var arr = new Array();
        var arrInt;
        var anio;
        var mes;
        var dia;
        var i;
        for (i = 0; i < arreglo.length; i++) {
            arrInt = new Array();
            anio = arreglo[i][0].substring(0, 4);
            mes = arreglo[i][0].substring(5, 7);
            dia = arreglo[i][0].substring(8);
            arrInt[0] = new Date(anio, mes - 1, dia).getTime();
            arrInt[1] = arreglo[i][1] == -989898 ? null : arreglo[i][1];
            arr.push(arrInt);
        }
        return arr;
    }
    datos1 = transforma1(datos1);
    Highcharts.setOptions({
        lang: {
            months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            shortMonths: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            weekdays: ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"],
            decimalPoint: ".",
            thousandsSep: ",",
            rangeSelectorFrom: "De",
            rangeSelectorTo: "Hasta",
            downloadPNG: "Descargar gra&#769;fica PNG",
            downloadJPEG: "Descargar gra&#769fica JPEG",
            downloadPDF: "Descargar gra&#769fica PDF",
            downloadSVG: "Descargar gra&#769fica SVG",
            printChart: "Imprimir gra&#769;fica",
            rangeSelectorZoom: "",
        },
    });
    window.chart = new Highcharts.StockChart({
        chart: {
            renderTo: "grafica",
            zoomType: "",
            pinchType: "",
        },
        rangeSelector: {
            buttonPosition: {
                align: 'right',
                x: -10
            },
            buttonTheme: {
                width: 70,
                fill: "none",
                r: 6,
                opacity: 1,
                stroke: "white",
                "stroke-width": 3,
                style: {
                    color: "black",
                },
                states: {
                    hover: {
                        fill: "silver",
                        stroke: "white",
                    },
                    select: {
                        style: {
                            color: "white",
                        },
                        fill: "gray",
                        stroke: "white",
                    },
                },
            },
            selected: 2,
            inputEnabled: false,
            inputDateFormat: "%e %B %Y",
            inputEditDateFormat: "%e %B %Y",
            inputBoxWidth: 120,
            inputBoxBorderColor: "white",
            buttons: [{
                    type: "year",
                    count: 1,
                    text: "1 a\u00F1o",
                },
                {
                    type: "year",
                    count: 2,
                    text: "2 a\u00F1os",
                },
                {
                    type: "year",
                    count: 3,
                    text: "3 a\u00F1os",
                },
                {
                    type: "all",
                    text: "Todos",
                },
            ],
        },
        title: {
            text: "Precio de la mezcla mexicana de petro&#769;leo",
            style: {
                color: "black",
            },
        },
        subtitle: {
            text: "Do&#769;lares por barril",
            style: {
                color: "black",
                fontWeight: "bold"
            },
        },
        xAxis: {
            lineColor: "silver",
            minRange: 31536000000,
            labels: {
                useHTML: true,
                overflow: true,
                formatter: function () {
                    return (
                        '<span style="display: block; text-align: center; margin: auto;">'
                        + Highcharts.dateFormat("%b<br/>%Y", this.value)
                        + "</span>"
                    );
                },
            },
        },
        yAxis: [{
                plotLines: [{
                    color: "gray",
                    width: 1,
                    zIndex: 1,
                    value: 0,
                }, ],
                opposite: true,
                labels: {
                    formatter: function () {
                        if (this.value < 0) {
                            return '<span style="color: red;">' + Highcharts.numberFormat(this.value, 1) + "</span>";
                        } else if (this.value == 0) {
                            return '<span style="color: black;">' + Highcharts.numberFormat(this.value, 0) + "</span>";
                        } else {
                            return Highcharts.numberFormat(this.value, 1);
                        }
                    },
                },
            },
            {
                plotLines: [{
                    color: "#c0504d",
                    width: 1,
                    zIndex: 1,
                    value: 0,
                }, ],
                opposite: false,
                labels: {
                    formatter: function () {
                        if (this.value < 0) {
                            return '<span style="color: red;">' + Highcharts.numberFormat(this.value, 1) + "</span>";
                        } else if (this.value == 0) {
                            return '<span style="color: black;">' + Highcharts.numberFormat(this.value, 0) + "</span>";
                        } else {
                            return Highcharts.numberFormat(this.value, 1);
                        }
                    },
                },
            },
        ],
        tooltip: {
            useHTML: true,
            borderColor: "silver",
            crosshairs: {
                dashStyle: "dash",
            },
            style: {
                whiteSpace: 'nowrap',
            },
            formatter: function () {
                var s = "";
                s += Highcharts.dateFormat("%e %B %Y", this.x) + "<br/>";
                $.each(this.points, function (i, point) {
                    {
                        if (point.y < 0) {
                            s +=
                                '<span style="color: '
                                + point.series.color
                                + ';">'
                                + point.series.name
                                + "</span>"
                                + ": "
                                + '<span style="color: red;">'
                                + Highcharts.numberFormat(point.y, 2)
                                + "</span>"
                                + "<br>";
                        } else {
                            s +=
                                '<span style="color: '
                                + point.series.color
                                + ';">'
                                + point.series.name
                                + "</span>"
                                + ": "
                                + Highcharts.numberFormat(point.y, 2)
                                + "<br>";
                        }
                    }
                });
                return s;
            },
        },
        series: [{
            name: "Mezcla mexicana",
            data: datos1,
            showInNavigator: true,
            yAxis: 0,
            color: "#f79646",
            shadow: true,
            visible: true,
            connectNulls: true,
            dataGrouping: {
                enabled: false,
            },
        }, ],
        legend: {
            enabled: true,
            alignColumns: false,
            align: "center",
            itemStyle: {
                color: "black",
            },
            itemHiddenStyle: {
                color: "silver",
            },
            itemHoverStyle: {
                color: "black",
            },
            borderColor: "white",
            layout: "horizontal",
            verticalAlign: "bottom",
        },
        navigator: {
            outlineColor: "gray",
            outlineWidth: 0.5,
            maskFill: "rgba(0, 0, 0, 0.10)",
            series: {
                type: "line",
            },
            xAxis: {
                labels: {
                    enabled: false,
                },
            },
        },
        credits: {
            href: "https://www.banxico.org.mx/SieInternet/",
            text: "Sistema de Informacio&#769;n Econo&#769;mica",
        },
        navigation: {
            buttonOptions: {
                theme: {
                    "stroke-width": 1,
                    stroke: "white",
                    r: 5,
                    states: {
                        hover: {
                            stroke: "white",
                            fill: "silver",
                        },
                        select: {
                            stroke: "silver",
                            fill: "silver",
                        },
                    },
                },
            },
            menuItemHoverStyle: {
                background: "gray",
                color: "white",
            },
        },
        exporting: {
            allowHTML: true,
            chartOptions: {
                rangeSelector: {
                    enabled: false,
                },
            },
            width: 2000,
            buttons: {
                contextButton: {
                    menuItems: [{
                            text: "Descargar datos JPG",
                            onclick: function () {
                                this.exportChart({
                                    type: "application/jpg",
                                    filename: "Cosulta_Banxico.jpg",
                                });
                            },
                        },
                        {
                            text: "Descargar datos PNG",
                            onclick: function () {
                                this.exportChart({
                                    type: "application/png",
                                    filename: "Cosulta_Banxico.png",
                                });
                            },
                        },
                        {
                            separator: true,
                        },
                        {
                            text: "Descargar datos XLS",
                            onclick: function () {
                                window.open(
                                    "https://www.banxico.org.mx/SieInternet/consultarDirectorioInternetAction.do?accion=consultarSeries&locale=es&version=3&anoInicial=1996&anoFinal=2099&tipoInformacion=1,1&formatoHorizontal=false&metadatosWeb=true&series=SI744&formatoXLS.y=10",
                                    "_self"
                                );
                            },
                        },
                    ],
                },
            },
        },
    });
});
