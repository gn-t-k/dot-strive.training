import * as rhf from "react-hook-form";

type UseForm = <T extends rhf.FieldValues>(
  props: rhf.UseFormProps<T> & {
    defaultValues: T;
  }
) => rhf.UseFormReturn<T>;
export const useForm: UseForm = (props) => rhf.useForm(props);
