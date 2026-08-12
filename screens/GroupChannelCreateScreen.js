import { withTheme } from '@draftbit/ui';
import { useNavigation } from '@react-navigation/native';
import {
    useSendbirdChat,
    createGroupChannelCreateFragment,
} from '@sendbird/uikit-react-native';
import { useEffect } from 'react';
import * as GlobalVariables from '../config/GlobalVariableContext';

const GroupChannelCreateFragment = createGroupChannelCreateFragment();

export const GroupChannelCreateScreen = () => {
    const navigation = useNavigation();
    const Constants = GlobalVariables.useValues();
    const { SendBirdInfo, clinic_pk_id } = Constants;
    const { metadata } = SendBirdInfo;

    const { sdk } = useSendbirdChat();
    //   console.log("==== [String(clinic_pk_id)] : ",metadata?.practice_id, clinic_pk_id)
    //     useEffect(() => {
    //         const fetchData = async () => {
    //           // console.log('=========PRovider Constants : ', Constants);

    //           const responseSenbdbird = await fetch(
    //             `${Constants.API_BASE_URL_SENDBIRD}/users?limit=20&token=&metadatakey=practice_id&metadatavalues_in=1`, // provider
    //             {
    //               headers: {
    //                 'Content-Type': 'application/json',
    //                 'Access-Token' : Constants.SendBirdInfo?.access_token,
    //                 'Api-Token' : '29addb3af5345c357edd12312731fefdca7ac721',
    //                 'App-Id' : '3DF0E5C5-271A-4B6C-995C-E18AEF3D809E',

    //               },
    //             }
    //           );
    //           const apiSenbdbirdData = await responseSenbdbird.json();
    // console.log("===== responseSenbdbird : ",apiSenbdbirdData)


    //         };

    //         fetchData();
    //       }, []);


    const queryCreator = () => {
        return sdk.createApplicationUserListQuery({
            limit: 100,
            metaDataKeyFilter: "practice_id",
            metaDataValuesFilter: [String(metadata?.practice_id)], // [String(clinic_pk_id)]
            //   token: "YHQSRlNaQlZBf0VYXVFXFGByEktWUEs6",  // if using pagination
        });
    };
    return (

        <GroupChannelCreateFragment
            onCreateChannel={(channel) => {
                console.log('Created Channel →', channel.url);
                navigation.replace('GroupChannel', { channelUrl: channel.url });
            }}
            onPressHeaderLeft={() => navigation.goBack()}
            searchEnabled={true}
            queryCreator={queryCreator}
        />
    );
};
export default withTheme(GroupChannelCreateScreen);
