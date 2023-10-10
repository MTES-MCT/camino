<#import "template.ftl" as layout>
<#import "password-commons.ftl" as passwordCommons>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password','password-confirm'); section>

    <#if section = "form">
        <main class="fr-pt-md-14v" role="main" id="content">
    <div class="fr-container fr-container--fluid fr-mb-md-14v">
        <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
            <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
                <div class="fr-container">
                <h1>Mise à jour du mot de passe</h1>
                </div>
                <div class="fr-container fr-background-alt--grey fr-px-md-0 fr-py-10v fr-py-md-14v">
                    <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
                        <div class="fr-col-12 fr-col-md-9 fr-col-lg-8">
                            <div>
                                <form id="login-1760" action="${url.loginAction}" method="post">

                                    <input type="text" id="username" name="username" value="${username}" autocomplete="username" readonly="readonly" style="display:none;"/>
                                    <input type="password" id="password" name="password" autocomplete="current-password" style="display:none;"/>
                                    <fieldset class="fr-fieldset" id="login-1760-fieldset" aria-labelledby="login-1760-fieldset-legend">
                                        <legend class="fr-fieldset__legend" id="login-1760-fieldset-legend">
                                            <h2>Changer votre mot de passe</h2>
                                        </legend>
                                        <div class="fr-fieldset__element">

                                        <#if messagesPerField.existsError('password', 'password-confirm')>
                                            <div class="fr-alert fr-alert--error fr-mb-3w">
                                                <h3 class="fr-alert__title">${kcSanitize(messagesPerField.getFirstError('password', 'password-confirm'))?no_esc}</h3>
                                            </div>
                                        </#if>
                                            <fieldset class="fr-fieldset" id="credentials">                                                
                                                <div class="fr-fieldset__element">
                                                    <div class="fr-input-group">
                                                        <label class="fr-label" for="password-new-1757">
                                                           ${msg("passwordNew")}
                                                        </label>
                                                        <input tabindex="1" class="fr-input" id="password-new-1757" type="password" name="password-new" 
                                                        autofocus autocomplete="new-password"
                                                        aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true</#if>"
                                                        >
                                                    </div>
                                                </div>
                                            </fieldset>
                                            <fieldset class="fr-fieldset" id="credentials">                                                
                                                <div class="fr-fieldset__element">
                                                    <div class="fr-input-group">
                                                        <label class="fr-label" for="password-confirm-1201">
                                                           ${msg("passwordConfirm")}
                                                        </label>
                                                        <input tabindex="2" class="fr-input" id="password-confirm-1201" type="password" name="password-confirm"
                                                        autocomplete="new-password"
                                                        aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>"
                                                        >
                                                    </div>
                                                </div>
                                            </fieldset>
                                        </div>
                                        <div class="fr-fieldset__element">
                                            <ul class="fr-btns-group">
                                                <li>
                                                    <button tabindex="3" class="fr-mt-2v fr-btn" name="login" type="submit">
                                                        Valider
                                                    </button>
                                                </li>
                                                <#if isAppInitiatedAction??>
                                                    <li>
                                                        <button type="submit" tabindex="4" class="fr-mt-2v fr-btn fr-btn--secondary" name="cancel-aia">
                                                            ${msg("doCancel")}
                                                        </button>
                                                    </li>
                                                </#if>
                                            </ul>
                                        </div>
                                    </fieldset>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

       
    </#if>
</@layout.registrationLayout>
