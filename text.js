function titlewrite(x, y, size, text)
{
  var i, xo, yo;
  var out="<svg width=\""+(size*text.length)+"\" height=\""+(size*1.6)+"\" style=\"overflow:visible; display:block; font-family:'Arial', sans-serif;font-size:"+size+"px;font-weight:bold;\">";

  for (i=0; i<Math.floor(size/5); i++)
    out+="<text style=\"opacity:"+(0.005*i)+";\" fill=\"#000000\" y=\""+((size*1.3)-i)+"\" x=\""+(Math.floor(size/5)-i)+"\">"+text+"</text>";

  out+="<text style=\"opacity:"+(0.005*i)+";\" fill=\"#333333\" y=\""+((size*1.3)-i)+"\" x=\""+(Math.floor(size/5)-i)+"\">"+text+"</text>";

  
  out+="<g>";
  for (i=0; i<Math.floor(size/10); i++)
    out+="<text style=\"opacity:1;\" fill=\"#333333\" y=\""+(Math.floor(size*1.1)-i)+"\" x=\"0\">"+text+"</text>";
  out+="</g>";

  out+="<text fill=\"url(#grad1)\" y=\""+size+"\" x=\"0\">"+text+"</text>";
  out+="<text style=\"opacity:0.6;\" fill=\"#ffffff\" y=\""+size+"\" x=\"0\" mask=\"url(#cutoutmask)\">"+text+"</text>";
   
  out+="<defs>";
  out+="<linearGradient id=\"grad1\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\"><stop offset=\"0%\" style=\"stop-color:rgb(255,255,0);stop-opacity:1\" /><stop offset=\"100%\" style=\"stop-color:rgb(255,0,0);stop-opacity:1\" /></linearGradient>";
  out+="<mask id=\"cutoutmask\"><g><text fill=\"#ffffff\" y=\""+size+"\" x=\"0\">"+text+"</text><text fill=\"#000000\" y=\""+(size*1.02)+"\" x=\"1\">"+text+"</text></g></mask>";
  
  out+="</defs>";
  
  out+="</svg>";

  return out;
}
