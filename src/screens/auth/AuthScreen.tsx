// src/screens/auth/AuthScreen.tsx
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';

// Initialize
GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_CLIENT_ID',
});

const AuthScreen = () => {
  // Email sign-up state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Google Sign-In
  const googleSignIn = async () => {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    // Handle authentication
  };

  // Apple Sign-In
  const appleSignIn = async () => {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    
    // Handle authentication
  };

  return (
    <View className="p-4">
      {/* Email Form */}
      <TextInput 
        placeholder="Email" 
        value={email}
        onChangeText={setEmail}
        className="border p-3 mb-3"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="border p-3 mb-4"
      />
      <Button title="Sign Up with Email" onPress={/*...*/} />

      {/* OAuth Options */}
      <View className="flex-row justify-between my-6">
        <TouchableOpacity 
          className="bg-red-500 p-4 rounded-full"
          onPress={googleSignIn}
        >
          <Text className="text-white">G</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-black p-4 rounded-full"
          onPress={appleSignIn}
        >
          <Text className="text-white">A</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};