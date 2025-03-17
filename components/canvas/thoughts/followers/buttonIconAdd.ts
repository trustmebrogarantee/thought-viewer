export const buttonIconAdd = (ctx, follower) => {
  const buttonRadius = follower.box.width / 2
  const x = follower.position.x + buttonRadius 
  const y = follower.position.y + buttonRadius

    ctx.beginPath();
    ctx.arc(x, y, buttonRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(77, 91, 210, 0.9)';
    ctx.fill();

    // Draw plus sign
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    
    // Vertical line
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x, y + 8);
    
    // Horizontal line
    ctx.moveTo(x - 8, y);
    ctx.lineTo(x + 8, y);
    
    ctx.stroke();
    ctx.fill()
}