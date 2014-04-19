var app = angular.module('app', ['angular-gestures','ngRoute', 'ngAnimate']);
var api_key = "bf3ca614e94395d153a5d183e93879e8";

app.config(function($routeProvider) {

    $routeProvider

        // home page
        .when('/', {
            templateUrl: 'page-home.html',
            controller: 'mySeriesController'
        })

        .when('/serie/:id', {
            templateUrl: 'page-serie.html',
            controller: 'serieController'
        })

        .when('/episode', {
            templateUrl: 'page-episode.html',
            controller: 'episodeController'
        });

});

/* BACK */
var serie = function(title){
    this.title=title,
    this.seasons=new Array(),
    this.tmdb_id=0,
    this.count={
        episodes_v:0,
        episodes_t:0,
        percentage:0
    }
};

var data = function() {

    var storage = window.localStorage;

    // Main data
    this.series = new Array();
    this.seasons = new Array();

    this.getStats = function(){
        for(var i=0;i<this.series.length;i++){

            var count_t=0;
            var count_v=0;

            for(var j=0;j<this.series[i].seasons.length;j++){
                count_t+=this.series[i].seasons[j].length;

                for(var k=0;k<this.series[i].seasons[j].length;k++){
                    if(this.series[i].seasons[j][k]===true){
                        count_v++;
                    }
                }

            }

            this.series[i].count.episodes_t=count_t;
            this.series[i].count.episodes_v=count_v;
            if(count_t==0){
                this.series[i].count.percentage=0;
            }else{
                this.series[i].count.percentage=(count_v/count_t)*100;
            }
        }
    };

    // Add episode/s to a serie
    this.addEpisode = function(id_serie,id_season,nb,seen){
        var episodes = seen;
        for(var i = 0; i<nb; i++)
            this.series[id_serie].seasons[id_season].push(episodes);
    };

    // Add episode/s to a serie
    this.removeEpisode = function(serie_index,season_index){
       this.series[serie_index].seasons[season_index].splice(this.series[serie_index].seasons[season_index].length-1,1);
    };

    // Add a season to a serie with nb of episodes
    this.addSeason = function(id,nb,seen){
        var season = new Array();
        
        this.series[id].seasons.push(season);
    };
    this.removeSeason = function(serie_index){
        var nb_season = parseInt(this.series[serie_index].seasons.length)-2;
        this.series[serie_index].seasons.splice(serie_index,1);
    };

    // Series
    this.addSerie = function(title,callback){
        var new_serie = new serie(title);
        this.series.push(new_serie);
        callback();
    };
    this.removeSerie = function(index){
        this.series.splice(index,1);
    };

    this.saveLocal = function(){
        storage.setItem('series',JSON.stringify(this.series));
    };
    this.getLocal = function(){
        var data = JSON.parse(storage.getItem('series'));

        if(data != null)
            this.series = JSON.parse(storage.getItem('series'));
        }
}

app.run(function ($rootScope, $location) {

    var history = [];

    $rootScope.$on('$routeChangeSuccess', function() {
        history.push($location.path());
    });

    $rootScope.back = function() {
        var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
        $location.path(prevUrl);
    };

});

app.factory('navService', function(){
  var obj = {}
  return {
  
  getValue: function(update) {
      var defaultValue = 'disabled';
      
      if( typeof(update)==='undefined') {   obj.state = defaultValue; }
        else {  obj.state = update;   }
        
     return obj;
    }
    }    
    
});

    var data_s = new data();

/* FRONT */
app.controller('navController', function($scope, navService, $http, $location){
    $scope.navactive = navService.getValue();

    $scope.buttons = {
        menuright: ""
    };

    $scope.goHome = function(){
        $location.path("/");
    };

    $scope.goPrevious = function(){
    };

    $scope.showRightMenu = function(){
        $scope.buttons.menuright = $scope.buttons.menuright === "opened" ? " ": "opened";
        console.log($scope.buttons.menuright);
    };

});




/* FRONT */
app.controller('serieController', function($scope, navService, $http, $location, $routeParams,$http){
    var id = $routeParams.id;
    var title = data_s.series[id].title;

    $scope.error_res = "err-none";
    $scope.error_co = "err-none";

    navService.getValue('active');

    $scope.pageClass = 'page-serie';
});

/* FRONT */
app.controller('episodeController', function($scope, navService, $http, $location){
    navService.getValue('active');
    $scope.pageClass = 'page-episode';
});

app.controller('mySeriesController', function($scope, navService, $http, $location){
    navService.getValue('disabled');
    
    $scope.pageClass = 'page-home';

    $scope.buttons = {
        serie : new Array(),
        seasons : new Array(),
        menuserie: "",
        episodedetails : ""
    };

    /* SERIES */

    // Update serie
    data_s.getLocal();
    $scope.series = data_s.series;

    $scope.removeSerie = function(index){
        data_s.removeSerie(index);
        data_s.getStats();
        data_s.saveLocal();
    };

    $scope.addSeason = function(index){
        data_s.addSeason(index,1,false);
        data_s.getStats();
        data_s.saveLocal();
    };

    $scope.removeSeason = function(serie_index){
        data_s.removeSeason(serie_index);
        data_s.getStats();
        data_s.saveLocal();
    };

    $scope.addEpisode = function(serie_index,season_index){
        data_s.addEpisode(serie_index,season_index,1,false);
        data_s.getStats();
        data_s.saveLocal();
    };
    $scope.removeEpisode = function(serie_index,season_index){
        data_s.removeEpisode(serie_index,season_index);
        data_s.getStats();
        data_s.saveLocal();
    };

    $scope.showSerieButtons = function(index,e){
        $scope.buttons.serie[index] = $scope.buttons.serie[index] === "opened" ? "": "opened";
    };

    $scope.showSeasonButtons = function(serie_index,season_index){
        if($scope.buttons.seasons[serie_index]==null){
            $scope.buttons.seasons[serie_index]=new Array();
        }

        $scope.buttons.seasons[serie_index][season_index] = $scope.buttons.seasons[serie_index][season_index] === "opened" ? null: "opened";
    };

    $scope.addSerie = function(){        
        data_s.addSerie($scope.form.title,function(){

            $http.jsonp('http://api.trakt.tv/search/shows.json/bf3ca614e94395d153a5d183e93879e8/'+$scope.form.title+"/1/seasons/?callback=JSON_CALLBACK")
            .success(function(data){
                if(data.length!=0){
                    var seasons = new Array();
                    for(var i in data[0].seasons){
                        seasons[data[0].seasons[i].season]=new Array();
                         for(var j=0; j<data[0].seasons[i].episodes.length; j++){
                           seasons[data[0].seasons[i].season].push(j);
                        }
                        
                    }

                    var serie_index = data_s.series.length-1;
                    console.log(seasons);
                    var decal=0;
                    for(var i in seasons){
                        if(i!=0){
                            data_s.addSeason(serie_index,1,false);
                             for(var j in seasons[i]){
                                data_s.addEpisode(serie_index,i-1,1,false);
                            }
                        }
                    }

                    data_s.getStats();
                    data_s.saveLocal();
                }
            })
            .error(function(data){
            });

        });

        data_s.getStats();
        data_s.saveLocal();
    };

    $scope.checkEpisode = function(serie_index,season_index,episode_index){
        $scope.series[serie_index].seasons[season_index][episode_index] = $scope.series[serie_index].seasons[season_index][episode_index] === false ? true: false;
            data_s.getStats();
        data_s.saveLocal();
    };

    $scope.showSerieDetails = function(id){
        $location.path("/serie/"+id);
    };

    $scope.showEpisodeDetails = function(){
        $location.path("/episode");
    };
});

