'use strict';
angular
    .module('omarApp')
    .directive('map', map);

    function map() {
        return {
            restrict: 'A',
            scope: {
                params: '=' // = provides two-way data binding
            },
            link: function(scope, element, attrs){

                scope.$watch('map', function(value){
                    console.log('value', value);
                });
                console.log(scope);
                console.log(element);
                console.log(attrs.id);

                var map = new ol.Map({
                    target: attrs.id,
                    layers: [
                        new ol.layer.Tile({
                            source: new ol.source.OSM()
                        })
                    ],
                    view: new ol.View({
                        center: ol.proj.fromLonLat([-101.2559799,37.5539524]),
                        zoom: 12
                    })
                });

            },
            replace: true,
            template: '<div></div>'
        };
    }
