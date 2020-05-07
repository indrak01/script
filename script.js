process.on('uncaughtException', function (err) {});

require( 'events' ).EventEmitter.prototype._maxListeners = 0;

let [ search_engine, util, url, request ] = [ require( 'search-engine-nodejs' ).default, require( 'util' ), require( 'url' ), require( 'req-fast') ]
let keywords = require( "fs-extra" ).readFileSync( "keywords.txt" ).toString().split( "\n" )


let arr = [],
  domains = [];

(async () => {
  const options = {
    pageOfResult: 0,
    qs: {
      q: ''
    }
  }

  for ( let i = 0; i < keywords.length; i++ ) {
    for ( let j = 0; j < 77; j++ ) {
      options.pageOfResult = j;
      options.qs.q = keywords[ i ];
      let results = await search_engine.Bing( options )
      arr.push( results )
    }
  }

  let arr2 = [].concat( ...new Set( arr ) );
  arr2 = arr2.filter( ( item, index, self ) => self.indexOf( item ) == index );

  for ( let ii = 0; ii < arr2.length; ii++ ) {
    if ( typeof arr2[ ii ].link == "undefined" ) continue;
    setTimeout( async function () {
      let domain = url.parse( arr2[ ii ].link ).hostname
      if ( domains.includes( domain ) ) return;
      domains.push( domain )
	  	  
      request(`https://${domain}`, function (error, response) {
	try {
	  if( error.code == "ECONNRESET" ) return;
	}catch(err){}
	      
       if( typeof response === 'undefined' ) return;
	      
       if ( response.statusCode == 404 ) {
        require( "fs-extra" ).appendFile( "found.txt", "https://" + domain + "\r\n" )
		console.log(`https://${domain} does NOT exists \r\n`)
       } else {
		   console.log(`https://${domain} exists \r\n`)
	   }
	  })
    }, ii * 1000 )
  }
} )();
