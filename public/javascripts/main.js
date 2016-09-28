require.config({
    paths: {
　　　　　　jquery: "http://act.m.yystatic.com/act/js/jquery-1.8.0.min",
            jsonp:  "http://act.m.yystatic.com/act/js/jsonp",
            IScroll:'./IScroll',
            MusicVisualizer:'./MusicVisualizer',
            render:'./render'
　　},	
　　shim: {
	        'jquery':{
	           exports: 'jquery'	
	        },
	        'jsonp':{
	           deps: ['jquery'],	
	           exports: '$.jsonp'	
	        },
	        'IScroll':{
	        	exports:'IScroll'
	        }        	        
　　}
});

require(["render"], function(render) {
    render.init();       
})
