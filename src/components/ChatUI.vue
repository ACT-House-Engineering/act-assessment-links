<script setup type="ts">
import { computed, onMounted, ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import qs from 'qs'

import { getSiteHost } from '~/lib/utils'

defineEmits(['update:body'])

// Docs - https://vueuse.org/core/useClipboard/
const { copy } = useClipboard()
// Docs - https://vueuse.org/core/useShare/
const shareApi = useShare()
// Docs - https://ui.nuxt.com/components/notification#usage
const toast = useToast()

const isAtCopyUrl = false
const canWebShare = false
const noKeyboard = true
const defaultMockupWidth = 375
const defaultMockupRatio = 1.6

const assessmentInput = ref(null)
const body = ref('')

const baseQualtricsUrl = 'https://acthouse.qualtrics.com/jfe/form/SV_diFXff98yhCdXsa'

function getAssessmentUrl() {
    // We want to use the qs package instead of native URLSearchParams
    // because it uses %20 instead of + for spaces
    // Qualtrics uses %20
    const queryString = qs.stringify({
        Organization: body.value.trim(),
    })

    return `${baseQualtricsUrl}?${queryString}`
}

const hasAnyInput = computed(() => {
    return body.value?.trim().length > 0
})
const assessmentUrl = computed(() => {
    return getAssessmentUrl()
})

function copyAssessmentUrl() {
    if (!process.client) {
        throw new Error('This function can only be called on the client side')
    }

    copy(getAssessmentUrl())

    toast.add({
        title: 'Copied!',
        description: 'The Assessment URL has been copied to your clipboard.',
        status: 'success',
        duration: 2000,
    })
}

function webShare() {
    shareApi.share({
        title: 'ACT Assessment',
        text: 'Take the ACT Assessment',
        url: assessmentUrl.value,
    })
}

const shareMethods = [
    {
        name: 'Copy',
        icon: 'i-heroicons-link',
        action: copyAssessmentUrl,
    },
    // {
    //     name: 'QR Code',
    //     icon: 'heroicons-outline:qrcode',
    //     action: 'qr',
    // // },
]

if (shareApi.isSupported) {
    shareMethods.push({
        name: 'Assessment',
        icon: 'i-heroicons-arrow-up-on-square',
        action: webShare,
    })
}

onMounted(() => {
    // nextTick(() => {
    //     // Auto focus on the content editable
    //     if (assessmentInput.value) {
    //         console.log('assessmentInput', assessmentInput.value.focus)
    //     // this.$refs[assessmentInput].value.focus()
    //     }
    // })
})
</script>

<template>
    <div
        class="builder-device-wrapper max-w-sm w-full"
        :style="{
            width: defaultMockupWidth,
        }"
    >
        <div
            class="builder-device-ratio relative"
            :style="{
                aspectRatio: 1 / defaultMockupRatio,
            }"
        >
            <div
                class="builder-device-outer absolute inset-0 border border-3 border-gray-300 overflow-hidden shadow-2xl p-5"
                style="border-radius: 30px;"
            >
                <div
                    class="builder-device-inner w-full h-full shadow-2xl overflow-hidden pb-8"
                >
                    <div class="builder-device-background relative w-full h-full">
                        <div class="builder-device-top-bar w-full text-xs font-semibold flex justify-between rounded-t-lg py-2 px-4">
                            <div class="time">
                                1:24
                            </div>

                            <div class="network">
                                5G
                            </div>
                        </div>

                        <div
                            class="builder-device-message-frame relative w-full h-full flex flex-col rounded-2xl"
                        >
                            <div class="builder-device-message-frame-upper h-full flex flex-col">
                                <div
                                    :class="[
                                        'builder-device-frame-header w-full rounded-t-lg p-2',
                                        'flex flex-row justify-between items-center',
                                    ]"
                                >
                                    <Icon
                                        name="heroicons-outline:menu"
                                        size="24"
                                        opacity="0.5"
                                    />
                                    <div class="font-medium text-center">
                                        ACT Assessment Links
                                    </div>
                                    <a :href="assessmentUrl" target="_blank">
                                        <Icon
                                            name="heroicons-outline:pencil-alt"
                                            size="24"
                                            :opacity="hasAnyInput ? 1 : 0.5"
                                        />
                                    </a>
                                </div>

                                <div class="builder-device-messages-area w-full h-full flex flex-col justify-around items-center space-y-3 py-6 px-2">
                                    <div class="border-3 border-dashed border-current rounded-xl p-3">
                                        <div class="relative text-center w-48 h-48">
                                            <div
                                                class="empty-message absolute inset-0 flex items-center justify-center"
                                                :style="{
                                                    opacity: Number(!hasAnyInput),
                                                }"
                                            >
                                                Type the Project or Group Name for this assessment link.
                                                <br><br>
                                                This is how it will show up in Airtable and dash.act.house.
                                            </div>
                                            <template v-if="hasAnyInput">
                                                <UButton
                                                    v-for="method in shareMethods"
                                                    :key="method.action"
                                                    :icon="method.icon"
                                                    size="xl"
                                                    padded
                                                    square
                                                    color="white"
                                                    class="scale-150 p-4 mx-4"
                                                    @click="method.action"
                                                />
                                            </template>
                                        </div>
                                    </div>

                                    <div
                                        class="font-bold text-xl"
                                        :style="{
                                            opacity: Number(hasAnyInput),
                                        }"
                                    >
                                        <div v-if="isAtCopyUrl">
                                            Scan to copy
                                        </div>
                                        <div
                                            v-else
                                            class="flex flex-col gap-2 text-xs text-center"
                                        >
                                            <pre class="whitespace-pre-wrap break-all">{{ assessmentUrl }}</pre>
                                            <a :href="assessmentUrl" class="text-blue-500" target="_blank">
                                                <button class="border border-blue-500 rounded px-2 py-1">Test Link</button>
                                            </a>

                                            <button
                                                v-if="canWebShare"
                                                class="border text-blue-500 border-blue-500 rounded px-2 py-1"
                                                @click="share"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                class="builder-device-keyboard-area w-full" :class="[
                                    noKeyboard ? '' : 'h-full',
                                ]"
                            >
                                <div class="flex items-end space-x-2 px-2">
                                    <span class="inline-flex h-full items-end font-light text-gray-500">
                                        <Icon
                                            name="heroicons-outline:camera"
                                            class="p-1"
                                            :style="{
                                                height: 34,
                                                width: 34,
                                            }"
                                        />
                                    </span>
                                    <div
                                        class="flex items-center w-full border border-gray-700 overflow-hidden"
                                        :style="{
                                            'border-radius': '1em',
                                        }"
                                    >
                                        <ContentEditable
                                            ref="assessmentInput"
                                            v-model="body"
                                            contenteditable
                                            autofocus
                                            tag="span"
                                            role="textbox"
                                            type="text"
                                            name="body"
                                            aria-label="Message Body"
                                            class="outline-none block text-left w-full border-0 px-4"
                                            placeholder=""
                                        />

                                        <span class="inline-flex h-full items-end font-light text-gray-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                class="h-8 w-8"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fill-rule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                                                    clip-rule="evenodd"
                                                />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
