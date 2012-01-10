var api = {};

api.model = function( model ){
  // return the wrapped API
  var wrapper = {};
  wrapper.save = function(params, callback){
    if( params._id ){
      model.findById( params._id, function(err, instance){
        for( var key in params ){
          if( key != '_id' ){
            instance[ key ] = params[ key ];
            instance.save(function(err){
              callback(err, instance);
            });
          }
        }
      });
    }else{
      instance = new model(params);
      instance.save(function(err){
        callback(err, instance);
      });
    }
  };

  wrapper.search = function(params, callback){
    if( typeof params == 'function' ){
      callback = params; params = null;
    }
    model.find( params, function(err, instances){
      callback(err, instances);
    });
  };

  wrapper.get = function(id, callback){
    model.findById(id, function(err,instance){
      callback(err, instance);
    })
  };

  // proxy static model methods from mongoose model
  // to the client wrapper
  var statics = Object.keys(model);
  for( var i = 0; i < statics.length; i++ ){
    if( statics[i] != 'modelName' ){
      var proxyStatic = function(static_function){
        wrapper[ statics[ i ] ] = function(){
          static_function.apply(model,arguments);
        }
      }
      proxyStatic( model[ statics[ i ] ] );
    }
  }
  return wrapper;
}

module.exports = api;