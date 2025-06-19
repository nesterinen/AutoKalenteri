<h1 align="center"> AutoKalenteri - Wordpress plugin for Wörkkis työpaja </h1>

<p align="center"><img src="github/kalenteri.png"/></p>

<h2 align="center"> AutoKalenteri is a simple wordpress plugin for managing availability of vehicles</h2>

<h3> Functionality: </h3>
<ul>
  <li>View reservations</li>
  <li>Create reservations</li>
  <li>Remove reservations</li>
  <li>Update reservations</li>
</ul>

<a href="https://fullcalendar.io/"> This plugin uses Fullcalendar </a>

<h3> -Download & Installation- </h3>
<a href="https://codeload.github.com/nesterinen/AutoKalenteri/zip/refs/heads/main"> Download(.zip) </a>

<p>Then login to your wordpress admin site, and go to the plugins page ~/wp-admin/plugins.php</p>
<ol>
  <li><img src="github/adNewPlug.png"></li>
  <li><img src="github/upldNewPlug.png"></li>
  <li><img src="github/brwsNewPlug.png"></li>
  <li><img src="github/selectNewPlug.png"></li>
  <li><img src="github/wppluginmarked.png"/></li>
</ol>

<p>The plugin will then automatically create a <a href="github/wppages.png">page</a> and database <a href="github/table.png">table</a> for the plugin</p>

<h3> -Changing which vehicles are available- </h3>
<p>List of vehicles and their respective display colors are hard coded into AutoKalenteri.php as a global variable. &#129318;</p>
<p>To access and modify AutoKalenteri.php in wordpress/wp-admin/plugin-editor.php</p>
<ul>
  <li>
    <h3>DISABLE PLUGIN BEFORE EDITING FILES.</h3>
    <p>Go to plugin file editor</p>
    <img src="github/wppluginbdropdown.png">
  </li>
  <li>
    <p>Select AutoKalenteri</p>
    <img src="github/wpselectpluginfile.png">
  </li>
  <li>
    <p>Find "global $available_cars;" variable</p>
    <img src="github/wpeditpluginfile.png">
  </li>
  <li>
    <p>Example: 'Leopard 2A6' => <span style="color:#6f9107">'#6F9107'</span> | 'nameOfVehice' => '#hexColor'</p>
    <img src="github/wpeditphpaddline.png">
  </li>
  <li>
    <p>Click Update to save changes.</p>
    <img src="github/wpupdatefile.png">
  </li>
  <li>
    <h3>ENABLE PLUGIN AGAIN HERE</h3>
    <p>Calendar now has a new option</p>
    <img src="github/wpkalenterinewadded.png">
  </li>
</ul>

<h3>-License-</h3>
This project is licensed under the MIT License

<h3>-Footnote-</h3>
<p>this is my first time being in the wordpress enviroment</p>
<p>this is my first time using php</p>