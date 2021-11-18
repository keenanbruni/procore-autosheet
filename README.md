# Expensify

Autosheet is an Electron/Node.js desktop application that locally syncs Procore drawings in bulk.

  - Procore user authentication handled through OAuth2
  - Utilizes underscore-observe & electron-store for state management

## Features & Implementation

Autosheet's content is split into 3 separate areas that handle the core functionality of the app:
* Login Page
* Dashboard
* Create/Edit Drawing Profile Modal

### Session

User authentication is handled by OAuth2 using Procore credentials. Once successfully authenticated, the user is routed to the Autosheet dashboard.

![Login Screen](https://i.imgur.com/Q422ou5.jpg)

### Autosheet Dashboard

The Autosheet dashboard displays a brief summary of existing drawing sync profiles. From this page the user has the option to add a new sync profile, edit an existing profile, or logout. 

![Autosheet Dashboard](https://i.imgur.com/DSEkF6O.jpg)

### Create/Edit Drawing Sync Profile

Upon clicking "Add Drawings" or clicking on an existing profile, the user is presented with a step-by-step modal dialogue to select which Procore drawing sets they want to download. The user can then choose to commence downloading, edit the profile, or delete the profile.

![Add Drawing Profile](https://i.imgur.com/5eb5pA1.jpg)
