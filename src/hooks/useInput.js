import { ref } from "vue";

/** Composable untuk two-way binding input: const [value, onChange] = useInput("") */
export function useInput(initialValue = "") {
  const value = ref(initialValue);
  const onChange = (eventOrValue) => {
    value.value = eventOrValue?.target ? eventOrValue.target.value : eventOrValue;
  };
  return [value, onChange];
}
