import React from 'react';
import { Image } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';

import HomeScreen from '../screens/Home/HomeScreen'
import ProductScreen from '../screens/Home/ProductScreen'
import ShoppingCartScreen from '../screens/ShopingCart/ShoppingCartScreen'
import OrderHistoryScreen from '../screens/OrderHistory/OrderHistoryScreen'

const Home = createStackNavigator(
    {
        HomeScreen: {
            screen: HomeScreen,
            navigationOptions: {
                headerShown: false,
            }
        },
        ProductScreen: {
            screen: ProductScreen,
            navigationOptions: {
                headerShown: false,
            }
        },
    },
    {
        initialRouteName: 'HomeScreen',
    }
);

Home.navigationOptions = ({ navigation }) => {
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
      navigation.state.routes.map(route => {
          if (route.routeName == "HomeDropScreen") {
              tabBarVisible = false;
          }
          else {
              tabBarVisible = true;
          }
      });
  }
  return {
      tabBarVisible
  };
};

const ShoppingCart = createStackNavigator(
  {
    ShoppingCartScreen: {
          screen: ShoppingCartScreen,
          navigationOptions: {
              headerShown: false,
          }
      },
  },
  {
      initialRouteName: 'ShoppingCartScreen',
  }
);

ShoppingCart.navigationOptions = ({ navigation }) => {
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
      navigation.state.routes.map(route => {
          if (route.routeName == "HomeDropScreen") {
              tabBarVisible = false;
          }
          else {
              tabBarVisible = true;
          }
      });
  }
  return {
      tabBarVisible
  };
};

const OrderHistory = createStackNavigator(
  {
    OrderHistoryScreen: {
          screen: OrderHistoryScreen,
          navigationOptions: {
              headerShown: false,
          }
      },
  },
  {
      initialRouteName: 'OrderHistoryScreen',
  }
);

OrderHistory.navigationOptions = ({ navigation }) => {
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
      navigation.state.routes.map(route => {
          if (route.routeName == "HomeDropScreen") {
              tabBarVisible = false;
          }
          else {
              tabBarVisible = true;
          }
      });
  }
  return {
      tabBarVisible
  };
};

const TabNavigation = createBottomTabNavigator(
  {
      Home,
      ShoppingCart,
      OrderHistory,
  },
  {
      defaultNavigationOptions: ({ navigation }) => ({
          tabBarIcon: ({ focused, horizontal, tintColor }) => {
              const { routeName } = navigation.state;
              //   let IconComponent = Icon;
              //   let iconName;
              var ImageUrl;
              if (routeName === 'Home') {
                  if (focused === true) {
                      tintColor = 'gray';
                      ImageUrl = require('../assets/iamges/ActiveHome.png')
                  } else {
                      ImageUrl = require('../assets/iamges/DeActiveHome.png')
                  }
                  return <Image source={ImageUrl} color={tintColor} style={{ width: 99, height: 46 }} />
              } else if (routeName === 'ShoppingCart') {
                  if (focused === true) {
                      tintColor = 'gray';
                      ImageUrl = require('../assets/iamges/ActiveShopping.png')
                  } else {
                      ImageUrl = require('../assets/iamges/DeActiveShopping.png')
                  }
                  return <Image source={ImageUrl} color={tintColor} style={{ width: 99, height: 46 }} />
              } else if (routeName === 'OrderHistory') {
                  if (focused === true) {
                      tintColor = 'gray';
                      ImageUrl = require('../assets/iamges/ActiveOrder.png')
                  } else {
                      ImageUrl = require('../assets/iamges/DeActiveOrder.png')
                  }
                  return <Image source={ImageUrl} color={tintColor} style={{ width: 99, height: 46 }} />
              }
          },
      }),
      tabBarOptions: {
          activeTintColor: 'white',
          showLabel: false,
          style: {
              backgroundColor: '#fff',
              //----------add this line------------------------//
              height: 83,
              borderColor:'#e5e5e5',
              borderTopRightRadius:50,
              borderTopLeftRadius :50,
              width:'100%',
          },
          labelStyle: {
              marginTop: -10,
              marginBottom: 10,
              fontSize: 15,
          },
      },
  },
);

export default createAppContainer(TabNavigation);
