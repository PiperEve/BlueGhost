// src/screens/LoginScreen.tsx
// src/screens/LoginScreen.tsx
// Add to the top
import { useAuthStore } from '../state/authStore';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuthStore(); // Get login function from your store

  // Update handleLogin function
  const handleLogin = async () => {
    try {
      // Perform actual login logic here (OAuth, email/password, etc.)
      const userData = await performLogin(); 
      
      // Update auth store
      login(userData);
      
      // Navigate to home screen
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login failed', error);
    }
  };
// Add to LoginScreen.tsx
const performLogin = async () => {
  // This would be your actual login implementation
  // For example, using Firebase auth:
  
  /*
  // Email/password example:
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
  */
  
  /*
  // Google sign-in example:
  const result = await GoogleSignin.signIn();
  const credential = GoogleAuthProvider.credential(result.idToken);
  const userCredential = await signInWithCredential(auth, credential);
  return userCredential.user;
  */
  
  /*
  // Apple sign-in example:
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });
  
  const { identityToken } = appleAuthRequestResponse;
  const credential = new OAuthProvider('apple.com').credential({
    idToken: identityToken,
  });
  
  const userCredential = await signInWithCredential(auth, credential);
  return userCredential.user;
  */
  
  // For demo purposes, return a mock user
  return {
    uid: 'user123',
    displayName: 'Ghost User',
    email: 'ghost@example.com',
    photoURL: null,
  };
};
  // ... rest of your fog screen implementation
}
// Animated Ripple Component using pure React Native
const AnimatedRipple = ({ x, y }: { x: number, y: number }) => {
  const size = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(size, {
        toValue: 300,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      })
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.rippleContainer,
        { 
          left: x, 
          top: y,
          transform: [{ scale: size }],
          opacity: opacity
        }
      ]}
    >
      <View style={styles.ripple} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  fogLayer: {
    position: 'absolute',
    top: '30%',
    width: '200%',
    height: 150,
  },
  fogGradient: {
    flex: 1,
    opacity: 0.6
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 50
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain'
  },
  logoFogOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    borderRadius: 100,
    opacity: 0.7
  },
  rippleContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 1,  // Initial size
    height: 1, // Initial size
    borderRadius: 300,
    backgroundColor: 'transparent',
  },
  ripple: {
    width: 1,
    height: 1,
    borderRadius: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  loginButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.7)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1
  }

import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  Animated, 
  Easing, 
  TouchableWithoutFeedback,
  Dimensions,
  Text 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation();
  // Fog animation
  const fogAnim = useRef(new Animated.Value(0)).current;
  // Touch ripple effect
  const [ripples, setRipples] = useState<{x: number, y: number, id: number}[]>([]);
  const rippleId = useRef(0);
  
  useEffect(() => {
    // Continuous fog drift animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fogAnim, {
          toValue: 1,
          duration: 25000,
          easing: Easing.linear,
          useNativeDriver: true
        }),
        Animated.timing(fogAnim, {
          toValue: 0,
          duration: 25000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  // Fog layer transformations
  const fog1Transform = fogAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-100%', '100%']
  });

  const fog2Transform = fogAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['100%', '-100%']
  });

  // Handle screen touch
  const handleTouch = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const newRipple = { x: locationX, y: locationY, id: rippleId.current++ };
    
    setRipples([...ripples, newRipple]);
    
    // Auto-remove ripple after animation
    setTimeout(() => {
      setRipples(prevRipples => prevRipples.filter(r => r.id !== newRipple.id));
    }, 2000);
  };

  // Handle login button press
  const handleLogin = () => {
    navigation.navigate('AuthOptions');
  };

  return (
    <TouchableWithoutFeedback onPress={handleTouch}>
      <View style={styles.container}>
        {/* Background */}
        <LinearGradient
          colors={['#0f172a', '#1e3a8a']}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Interactive Fog Ripples */}
        {ripples.map((ripple) => (
          <AnimatedRipple key={ripple.id} x={ripple.x} y={ripple.y} />
        ))}
        
        {/* Fog Layer 1 */}
        <Animated.View style={[
          styles.fogLayer, 
          { transform: [{ translateX: fog1Transform }] }
        ]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
            style={styles.fogGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
        </Animated.View>
        
        {/* Fog Layer 2 */}
        <Animated.View style={[
          styles.fogLayer, 
          { top: '60%', transform: [{ translateX: fog2Transform }] }
        ]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
            style={styles.fogGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
        </Animated.View>
        
        {/* Logo with fog interaction */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/bunny_logo.png')} 
            style={styles.logo} 
          />
          
          {/* Fog overlay on logo */}
          <LinearGradient
            colors={['rgba(31, 41, 55, 0.8)', 'transparent', 'rgba(31, 41, 55, 0.8)']}
            locations={[0, 0.5, 1]}
            style={styles.logoFogOverlay}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>
        
        {/* Login button */}
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Enter the Fog</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

});