(function(){
    'use strict';
    angular
        .module('omarApp')
        .controller('NavController', [NavController]);

        function NavController() {

        	// #################################################################################
            // AppO2.APP_CONFIG is passed down from the .gsp, and is a global variable.  It 
            // provides access to various client params in application.yml
            // #################################################################################
            //console.log('AppO2.APP_CONFIG in NavController: ', AppO2.APP_CONFIG);

            var vm = this;
        	/* jshint validthis: true */

        	vm.swipeAppEnabled = AppO2.APP_CONFIG.clientParams.swipeApp.enabled;

        	if (vm.swipeAppEnabled) {
        		
        		vm.swipeAppLink = AppO2.APP_CONFIG.clientParams.swipeApp.baseUrl;

        	}

        	vm.piwikAppEnabled = AppO2.APP_CONFIG.clientParams.piwikApp.enabled;

        	if (vm.piwikAppEnabled) {
        		
        		vm.piwikAppLink = AppO2.APP_CONFIG.clientParams.piwikApp.baseUrl;

        	}

        	vm.apiAppEnabled = AppO2.APP_CONFIG.clientParams.apiApp.enabled;

        	if (vm.apiAppEnabled) {
        		vm.apiAppLink = AppO2.APP_CONFIG.clientParams.apiApp.baseUrl;

        	}


        }

})();