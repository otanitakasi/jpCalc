import { createBottomTabNavigator, createAppContainer } from 'react-navigation';
import Water from './screens/Water';
import Powders from './screens/Powders';
import Renal from './screens/Renal';
import Others from './screens/Others';


const TabNavigator = createBottomTabNavigator({
  散剤: Powders,
  水剤: Water,
  腎機能: Renal,
  Others: Others,
});

export default createAppContainer(TabNavigator);
