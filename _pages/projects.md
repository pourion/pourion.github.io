---
layout: page
title: research
permalink: /research/
description: Modeling & Simulations of Complex Systems
nav: true
---
<p >
I study complex physical systems and specially their multiscale behaviors. My research is multidisciplinary and my style of scientific inquiry involves concurrent computational and analytical modeling.
</p>
<p>
As a computational scientist I develop mathematical models that describe the phenomenon of interest, and also develop numerical methods to solve the set of governing equations in parallel computing environments.
</p>
<p>
In my career I studied several complex systems from galaxy clusters, cell aggregates, atomic islands, to protein solutions. Currently I am investigating instabilities of high concentration protein formulations in pharmaceutical sciences.
</p>
<p>
Different aspects of my research is best captured by <a href="https://ccom.ucsd.edu/~mholst/pubs/dist/Hols94d.pdf5">Holst (1994)</a>: "steps required to solve a scientific problem of current interest using modern computers:
<ul>
<li> Statement of the physical problem as a governing system of equations</li>
<li> Analysis of the properties of the governing system</li>
<li> Construction and analysis of an approximating system</li>
<li> Development and analysis of numerical methods for the approximating system</li>
<li> Efficient implementation of the numerical methods on sequential or parallel computers</li>
<li> Analysis of the results."</li>
</ul>

Below, I organize my research works based on their general theme into three main categories: discovering governing equations, solving the equations, and analyzing the solutions. Please click for more details!

</p>

<div class="projects grid">

  {% assign sorted_projects = site.projects | sort: "importance" %}
  {% for project in sorted_projects %}
  <div class="grid-item">
    {% if project.redirect %}
    <a href="{{ project.redirect }}" target="_blank">
    {% else %}
    <a href="{{ project.url | relative_url }}">
    {% endif %}
      <div class="card hoverable">
        {% if project.img %}
        <img src="{{ project.img | relative_url }}" alt="project thumbnail">
        {% endif %}
        <div class="card-body">
          <h2 class="card-title text-lowercase">{{ project.title }}</h2>
          <p class="card-text">{{ project.description }}</p>
          <div class="row ml-1 mr-1 p-0">
            {% if project.github %}
            <div class="github-icon">
              <div class="icon" data-toggle="tooltip" title="Code Repository">
                <a href="{{ project.github }}" target="_blank"><i class="fab fa-github gh-icon"></i></a>
              </div>
              {% if project.github_stars %}
              <span class="stars" data-toggle="tooltip" title="GitHub Stars">
                <i class="fas fa-star"></i>
                <span id="{{ project.github_stars }}-stars"></span>
              </span>
              {% endif %}
            </div>
            {% endif %}
          </div>
        </div>
      </div>
    </a>
  </div>
{% endfor %}

</div>
