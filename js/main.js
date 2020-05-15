window.onload = () => { 
  console.log("Onload complete.")
  canvas = document.querySelector('canvas');
  ctx = canvas.getContext('2d');
  const b1 = boid.make( 1, 10, 30, 35, 290, 3, canvas.width / 2, canvas.height /2 )[0];

  for( let i = 0; i < 100; i++ ){
      boid.make( 1, 5, 36, 35, util.range(0, 360), 2, util.range(50, canvas.width), util.range(50, canvas.width) )
  }

  window.requestAnimationFrame( render.allCells );
};

let canvas, ctx;

// --------------------------------
// BOID BITS
// --------------------------------

const boid = {
  collection: [],
  newModel: ( type = '', size, viewRange, fieldOfView, degrees, speed, x, y ) => {
    const model = {
      type: type || '',
      size: size || 5,
      viewRange: viewRange || 20,
      fieldOfView: fieldOfView || 40,
      degrees: degrees || 0,
      speed: speed || 1,
      x: x || 100,
      y: y || 100,
      currentlyTurning: false,
      currentTurnDegree: 0
    };
    return model;
  },

  make: ( qty = 1, type = '', viewRange, fieldOfView, degrees, speed, x, y ) => {
    for( let i = 0; i < qty; i++ ){
      boid.collection.push( boid.newModel( qty, type = '', viewRange, fieldOfView, degrees, speed, x, y ) );
    }
    return boid.collection;
  },

  // --------------------------------
  // Boid collision utilities
  // --------------------------------

  collide: {
    wall: ( cell ) => {
      if( 
        cell.x >= canvas.width - 5 ||
        cell.y >= canvas.height - 5 ||
        cell.x < 3 ||
        cell.y < 3
      ){
        return true;
      } else {
        return false;
      }
    },

    boid: {
      // Todo.
    }
  },

  updateCoordinates: ( cell ) => {

    if( cell.currentlyTurning ){
      cell.degrees += cell.currentTurnDegree;
    } 

    let angle = util.toRadian( cell.degrees );
    cell.x += cell.speed * Math.cos(angle);   
    cell.y += cell.speed * Math.sin(angle);
  }
};

// --------------------------------
// Utilitiy tools
// --------------------------------

const util = {
  range: (num, range) => {
    return Math.abs( Math.round(Math.random() * ((num + range) - (num - range))) + (num - range) );
    },

  intersects: ( b1, b2 ) => {
    return ( b1.x < b2.x + b2.size &&
             b1.x + b1.size  > b2.x &&
             b1.y < b2.y + b2.size &&
             b1.y + b1.size > b2.y );
  },

  toRadian: ( degrees ) => {
    // The default 0 for canvas is to the right, -90 converts it to up.
    return ( degrees - 90 ) * Math.PI / 180;
  }
  
};

// --------------------------------
// Render tools
// --------------------------------

const render = {

  moveCell: ( cell ) => {
    // get those annoying over 360 values out of the way asap.
    if(cell.degrees > 360 ){
      cell.degrees =  cell.degrees - 360;
    } else if ( cell.degrees < 0 ){
      cell.degrees = cell.degrees + 360;
    }

    // Temporary range checker -- replace
    // render.tempCheck( cell, cell.degrees );

    const boidPathAhead = render.frontalCone( cell );

    boid.updateCoordinates( cell );
    
    if( cell.currentlyTurning && 
      ( boid.collide.wall( boidPathAhead.port ) || 
      boid.collide.wall( boidPathAhead.starboard ) ) 
    ){
      render.drawCell( cell );
      return;
    }

    if( boid.collide.wall( boidPathAhead.port ) ){
      cell.currentlyTurning = true;
      cell.currentTurnDegree = ( cell.fieldOfView * 0.5 ) * -1;
      render.drawCell( cell );
      return;
    } else if (boid.collide.wall( boidPathAhead.starboard )){
      cell.currentlyTurning = true;
      cell.currentTurnDegree = ( cell.fieldOfView * 0.5 ) ;
      render.drawCell( cell );
      return;      
    }

    cell.currentTurnDegree = 0;
    cell.currentlyTurning = false;
    render.drawCell( cell );
  },

  drawCell: ( cell ) => {
    const cx = cell.x + cell.size * 0.5;
    const cy = cell.y + cell.size * 0.5;

    let portAngle = util.toRadian( cell.degrees + 25 );
    let starboardAngle = util.toRadian( cell.degrees - 25 );
    ctx.beginPath();
    ctx.moveTo( cell.x, cell.y );
    let x = cell.size * Math.cos(portAngle);
    let y = cell.size * Math.sin(portAngle);
    ctx.lineTo( cell.x - x, cell.y - y );
    ctx.fillStyle = "red";
    ctx.stroke();
    ctx.closePath();
    // ctx.beginPath();
    x = cell.size * Math.cos(starboardAngle);
    y = cell.size * Math.sin(starboardAngle);
    ctx.lineTo( cell.x - x, cell.y - y );
    ctx.stroke();
    ctx.lineTo( cell.x, cell.y);
    ctx.fill();
    ctx.fillStyle = "red";
    ctx.globalAlpha = 1;
  },

  tempCheck: ( cell, degrees ) => {
    for( let i = cell.size + 2; i < cell.viewRange; i += cell.viewRange / 5 ){

      const scanAhead = {
        degrees: cell.degrees,
        x: cell.x + (i * Math.cos( util.toRadian(degrees) )) + 2.5,
        y: cell.y + (i * Math.sin( util.toRadian(degrees) )) + 2.5,
      }

      // Display detection points
      // ctx.fillRect( scanAhead.x, scanAhead.y, 2 , 2 )

      if( boid.collide.wall( scanAhead ) ){
        cell.degrees += cell.fieldOfView;
        break;

      }
    }
  },

  allCells: () => {
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    for( let i = 0; i < boid.collection.length; i++ ){
      render.moveCell( boid.collection[i] ); 
    }
    requestAnimationFrame( render.allCells );
  },

  frontalCone: ( cell, angle1, angle2 ) => {

    // Purely for readability purposes
    const port = {
      angle: util.toRadian( cell.degrees + cell.fieldOfView ),
      x: null,
      y: null
    };

    // These are defined after port as items within the object can't be used before the object is defined.
    // i.e x can't immediately be set with port.angle
    port.x = cell.x + cell.viewRange * Math.cos(port.angle);
    port.y = cell.y + cell.viewRange * Math.sin(port.angle);

    const starboard = {
      angle: util.toRadian( cell.degrees - cell.fieldOfView ),
      x: null,
      y: null
    };

    starboard.x = cell.x + cell.viewRange * Math.cos(starboard.angle);
    starboard.y = cell.y + cell.viewRange * Math.sin(starboard.angle);
    
    ctx.moveTo( cell.x, cell.y );
    ctx.beginPath();
    ctx.lineTo( port.x, port.y );
    ctx.lineTo( starboard.x, starboard.y );
    ctx.lineTo( cell.x, cell.y);
    ctx.globalAlpha = 0.1
    ctx.fill();
    ctx.globalAlpha = 1;

    return { port, starboard };
  }

};