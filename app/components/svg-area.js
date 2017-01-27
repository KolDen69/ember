import Ember from 'ember';

export default Ember.Component.extend({
  initD3: Ember.on('didInsertElement', function() {
    var n = 40,
      random = d3.randomUniform(0, 200),
      data = [],
      i = 0,
      yPos = 0,
      ticks = 10,
      duration = 100,
      self = this;

    var svg = d3.select("svg"),
      chartWidth = 500,
      margin = {top: 20, right: 20, bottom: 20, left: 40},
      width = chartWidth - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
      .domain([-ticks, 0])
      .range([0, width]);

    var y = d3.scaleLinear()
      .domain([0, 200])
      .range([height, 0]);

    var line = d3.line()
      .x(function(d, i) { return x(d.x); })
      .y(function(d, i) { return y(d.y); });

    g.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + y(0) + ")")
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y));

    g.append("g")
      .attr("clip-path", "url(#clip)")
      .append("path")
      .datum(data)
      .attr("class", "line")
      .transition()
      .duration(duration)
      .ease(d3.easeLinear)
      .on("start", tick);

    function tick() {
      data = data.map(function(el){
        return {
          x : el.x - .1,
          y:el.y
        }
      })

      var pos={
        x:i,
        y: yPos
      }

      data.push(pos);

      d3.select(this)
        .attr("d", line(data))
        .attr("transform", null);

      d3.active(this)
        .attr("transform", "translate(" + x(-ticks) + ",0)")
        .transition()
        .on("start", tick);

      if(data.length > duration)
      {
        i=0;
        data.shift();
      }
    }

    var scaleSlider = d3.scaleLinear()
      .domain([200, 0])
      .range([0, height])
      .clamp(true);

    var slider = svg.append("g")
      .attr("class", "slider")
      .attr("transform", "translate(" + (chartWidth+margin.right) + "," +  (margin.top+2) + ")");

    slider.append("line")
      .attr("class", "track")
      .attr("y1", scaleSlider.range()[0])
      .attr("y2", scaleSlider.range()[1])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-inset")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-overlay")
      .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() { hue(scaleSlider.invert(d3.event.y)); }));

    slider.insert("g", ".track-overlay")
      .attr("class", "ticks")
      .attr("transform", "translate(20,0)")
      .selectAll("text")
      .data(scaleSlider.ticks(10))
      .enter().append("text")
      .attr("y", scaleSlider)
      .attr("text-anchor", "middle")
      .text(function(d) { return d });

    var handle = slider.insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("r", 9);

    slider.transition()
      .duration(750)
      .tween("hue", function() {
        var i = d3.interpolate(0, 70);
        return function(t) { hue(i(t)); };
      });

    function hue(h) {
      handle.attr("cy", scaleSlider(h));
      yPos = h;
    }
  })

});
