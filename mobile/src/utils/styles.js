import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const colors = {
  primary: '#007AFF', // Modern iOS Blue
  secondary: '#5856D6', // Purple
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  background: '#F2F2F7', // Light gray background
  surface: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  white: '#FFFFFF',
  gray: '#C7C7CC',
  lightGray: '#E5E5EA',
  border: '#D1D1D6',
  overlay: 'rgba(0,0,0,0.5)',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24, // Increased padding from edges
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.37,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.white, // Standard cards are now white
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  formCard: {
    backgroundColor: colors.background, // Create Match still uses the block background
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  input: {
    height: 56, // Slightly taller for better touch target
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 17,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    height: 58,
    backgroundColor: colors.primary,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24, // Ensure text isn't near button edges
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginVertical: 10,
  },
  buttonSecondary: {
    height: 58,
    backgroundColor: colors.surface,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  buttonTextSecondary: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: 24, // Ensure centered content doesn't hit edges
  },
  row: {
    flexDirection: 'row',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  alignCenter: {
    alignItems: 'center',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  caption: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
});
