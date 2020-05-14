window.onload = () => { 
  console.log("Onload complete.")
  canvas = document.querySelector('canvas');
  ctx = canvas.getContext('2d');
  const b1 = boid.make( 1, 5, 30, 35, 0, 10, canvas.width / 2, canvas.height /2 )[0];
  console.log( b1.degrees )

  // ctx.fillRect(boid.collection[0].x, boid.collection[0].y, 3, 3);
  // render.drawCell( b1 );
  console.log( b1.degrees )
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
      y: y || 100
    };
    return model;
  },

  make: ( qty = 1, type = '', viewRange, fieldOfView, degrees, speed, x, y ) => {
    for( let i = 0; i < qty; i++ ){
      boid.collection.push( boid.newModel( qty = 1, type = '', viewRange, fieldOfView, degrees, speed, x, y ) );
    }
    return boid.collection;
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
    // The default 0 for canvas is right -90 converts it to up.
    return ( degrees - 90 ) * Math.PI / 180;
  }

  
};

// --------------------------------
// Render tools
// --------------------------------

const render = {

  rotateCell: ( cell ) => {
    // Snapshot the canvas
    const cx = cell.x + cell.size * 0.5;
    const cy = cell.y + cell.size * 0.5

    ctx.save();
    ctx.translate( cx, cy );
    ctx.rotate( cell.degrees * Math.PI / 180 );

    ctx.translate( -cx , -cy );
    //  ctx.drawImage(image, -2.5, -2.5);
    render.drawArrow( cell.x, cell.y, cell.size, 30 );
    ctx.restore();
  },

  moveCell: ( cell ) => {
    // get those annoying over 360 values out of the way asap.
    if(cell.degrees > 360 ){
      cell.degrees =  cell.degrees - 360;
    } else if ( cell.degrees < 0 ){
      cell.degrees = cell.degrees + 360;
    }

    let angle = util.toRadian( cell.degrees ); // compensate angle -90°, conv. to rad
    cell.x += cell.speed * Math.cos(angle);   
    cell.y += cell.speed * Math.sin(angle);
    render.drawCell( cell );
  },

  drawCell: ( cell ) => {
    render.rotateCell( cell );
    // render.drawArrow( cell )
  },

  // drawArrow: ( cell ) => {
  //   let angle = util.toRadian( cell.degrees + 30 )
  //   ctx.beginPath();
  //   ctx.moveTo(cell.x, cell.y);
  //   ctx.lineTo(cell.x - ( cell.size * Math.cos(angle) ), cell.y - ( cell.size ) * ( Math.sin(angle) ));
  //   ctx.stroke();
  //   ctx.beginPath();
  //   ctx.moveTo(cell.x, cell.y);
  //   ctx.lineTo(cell.x + ( cell.size * Math.cos(angle) ), cell.y - ( cell.size) * ( Math.sin(angle) ));
  //   ctx.stroke();
  // }

  drawArrow: ( x, y, size, degrees ) => {
    let angle = util.toRadian( degrees )
    ctx.beginPath();
    ctx.moveTo( x,  y);
    ctx.lineTo( x - (  size * Math.cos(angle) ),  y - (  size ) * ( Math.sin(angle) ));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo( x,  y);
    ctx.lineTo( x + (  size * Math.cos(angle) ), y - ( size) * ( Math.sin(angle) ));
    ctx.stroke();
  }

};